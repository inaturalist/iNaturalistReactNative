import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { searchObservations } from "api/observations";
import useIconicTaxaSectionObservations, {
  QUERY_KEY,
} from "components/MyObservations/hooks/useIconicTaxaSectionObservations";
import React from "react";
import Observation from "realmModels/Observation";
import { ICONIC_TAXA_GROUP } from "sharedHelpers/iconicTaxaGroupOrder";
import { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import useCurrentUser from "sharedHooks/useCurrentUser";
import factory from "tests/factory";

jest.mock( "api/observations" );
jest.mock( "components/LoginSignUp/AuthenticationService", ( ) => ( {
  getJWT: jest.fn( ( ) => Promise.resolve( "jwt" ) ),
} ) );
jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );
jest.mock( "sharedHelpers/logging", ( ) => ( {
  handleRetryDelay: ( ) => 0,
  reactQueryRetry: ( ) => false,
} ) );
jest.mock( "providers/contexts", ( ) => {
  const originalModule = jest.requireActual( "providers/contexts" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      useRealm: ( ) => ( {} ),
    },
  };
} );

const mockUser = factory( "LocalUser" );

const orderedCounts = [
  { category: ICONIC_TAXA_GROUP.PLANTAE, count: 45 },
  { category: ICONIC_TAXA_GROUP.AVES, count: 30 },
  { category: ICONIC_TAXA_GROUP.INSECTA, count: 0 },
];

const pageOf = uuids => ( { results: uuids.map( uuid => ( { uuid } ) ) } );

const renderSectionsHook = ( overrides = {} ) => {
  const queryClient = new QueryClient( {
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  } );
  const wrapper = ( { children } ) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return {
    ...renderHook(
      props => useIconicTaxaSectionObservations( {
        collapsedCategories: new Set( ),
        enabled: true,
        orderedCounts,
        sortBy: OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST,
        ...overrides,
        ...props,
      } ),
      { initialProps: {}, wrapper },
    ),
    queryClient,
  };
};

const paramsOfLastSearch = ( ) => searchObservations.mock.calls.at( -1 )[0];

beforeEach( ( ) => {
  jest.clearAllMocks( );
  useCurrentUser.mockReturnValue( mockUser );
  searchObservations.mockResolvedValue( pageOf( ["a", "b"] ) );
  jest.spyOn( Observation, "upsertRemoteObservations" ).mockImplementation( ( ) => undefined );
} );

afterEach( ( ) => {
  jest.restoreAllMocks( );
} );

describe( "useIconicTaxaSectionObservations", ( ) => {
  it( "requests only the most-observed category on open, filtered to that iconic taxon "
    + "and in the selected sort order", async ( ) => {
    renderSectionsHook( );

    await waitFor( ( ) => expect( searchObservations ).toHaveBeenCalledTimes( 1 ) );
    expect( paramsOfLastSearch( ) ).toMatchObject( {
      user_id: mockUser.id,
      iconic_taxa: [ICONIC_TAXA_GROUP.PLANTAE],
      order_by: "created_at",
      order: "desc",
      page: 1,
    } );
  } );

  it( "writes each page into Realm so tiles can hydrate from it", async ( ) => {
    renderSectionsHook( );

    await waitFor( ( ) => expect( Observation.upsertRemoteObservations ).toHaveBeenCalled( ) );
    expect( Observation.upsertRemoteObservations.mock.calls[0][0] )
      .toEqual( [{ uuid: "a" }, { uuid: "b" }] );
  } );

  it( "exposes a section per category on open, with the categories below the most-observed "
    + "one not yet fetched", async ( ) => {
    const { result } = renderSectionsHook( );

    await waitFor( ( ) => {
      expect( result.current.sections.get( ICONIC_TAXA_GROUP.PLANTAE ).uuids ).toEqual(
        ["a", "b"],
      );
    } );
    const plantae = result.current.sections.get( ICONIC_TAXA_GROUP.PLANTAE );
    const aves = result.current.sections.get( ICONIC_TAXA_GROUP.AVES );
    expect( plantae ).toMatchObject( { isActivated: true, hasMore: true, isError: false } );
    expect( aves ).toMatchObject( { isActivated: false, uuids: [] } );
  } );

  it( "fetches more results for the activated section when there is more to load", async ( ) => {
    const { result } = renderSectionsHook( );
    await waitFor( ( ) => expect( searchObservations ).toHaveBeenCalledTimes( 1 ) );

    act( ( ) => result.current.nearingEndOfSection( ICONIC_TAXA_GROUP.PLANTAE ) );

    await waitFor( ( ) => expect( searchObservations ).toHaveBeenCalledTimes( 2 ) );
    expect( paramsOfLastSearch( ) ).toMatchObject( {
      iconic_taxa: [ICONIC_TAXA_GROUP.PLANTAE],
      page: 2,
    } );
  } );

  it( "starts the next category when the one the user is in has nothing left to load, "
    + "without being collapsed", async ( ) => {
    searchObservations.mockResolvedValue( pageOf( ["a"] ) );
    const { result } = renderSectionsHook( {
      orderedCounts: [
        { category: ICONIC_TAXA_GROUP.PLANTAE, count: 1 },
        { category: ICONIC_TAXA_GROUP.AVES, count: 30 },
        { category: ICONIC_TAXA_GROUP.INSECTA, count: 0 },
      ],
    } );
    // hasMore comes from the counts, so waiting on it wouldn't tell us the page had landed
    await waitFor( ( ) => {
      expect( result.current.sections.get( ICONIC_TAXA_GROUP.PLANTAE ).uuids ).toEqual( ["a"] );
    } );
    expect( result.current.sections.get( ICONIC_TAXA_GROUP.PLANTAE ).hasMore ).toBe( false );

    act( ( ) => result.current.nearingEndOfSection( ICONIC_TAXA_GROUP.PLANTAE ) );

    await waitFor( ( ) => expect( searchObservations ).toHaveBeenCalledTimes( 2 ) );
    expect( paramsOfLastSearch( ) ).toMatchObject( {
      iconic_taxa: [ICONIC_TAXA_GROUP.AVES],
      page: 1,
    } );
    // the section the user has scrolled past keeps its tiles, so scrolling back up doesn't
    // land on an empty section or refetch what we already have
    expect( result.current.sections.get( ICONIC_TAXA_GROUP.PLANTAE ).uuids ).toEqual( ["a"] );
  } );

  it( "skips categories the server has no observations for", async ( ) => {
    searchObservations.mockResolvedValue( pageOf( ["a"] ) );
    const { result } = renderSectionsHook( );
    await waitFor( ( ) => expect( searchObservations ).toHaveBeenCalledTimes( 1 ) );

    act( ( ) => result.current.advanceFrontier( new Set( ) ) );
    await waitFor( ( ) => expect( searchObservations ).toHaveBeenCalledTimes( 2 ) );
    act( ( ) => result.current.advanceFrontier( new Set( ) ) );

    await waitFor( ( ) => {
      expect( result.current.sections.get( ICONIC_TAXA_GROUP.INSECTA ).isActivated ).toBe( false );
    } );
    expect( searchObservations ).toHaveBeenCalledTimes( 2 );
  } );

  it( "skips collapsed categories when deciding what to load first, so coming back to a view "
    + "with the top section closed still loads the sections below it", async ( ) => {
    renderSectionsHook( { collapsedCategories: new Set( [ICONIC_TAXA_GROUP.PLANTAE] ) } );

    await waitFor( ( ) => expect( searchObservations ).toHaveBeenCalledTimes( 1 ) );
    expect( paramsOfLastSearch( ) ).toMatchObject( {
      iconic_taxa: [ICONIC_TAXA_GROUP.AVES],
      page: 1,
    } );
  } );

  it( "passes over collapsed categories when advancing the frontier, rather than spending "
    + "the one in-flight request on a section the user can't see", async ( ) => {
    const { result } = renderSectionsHook( {
      collapsedCategories: new Set( [ICONIC_TAXA_GROUP.AVES] ),
      orderedCounts: [
        { category: ICONIC_TAXA_GROUP.PLANTAE, count: 45 },
        { category: ICONIC_TAXA_GROUP.AVES, count: 30 },
        { category: ICONIC_TAXA_GROUP.INSECTA, count: 20 },
      ],
    } );
    await waitFor( ( ) => expect( searchObservations ).toHaveBeenCalledTimes( 1 ) );

    act( ( ) => result.current.advanceFrontier( new Set( [ICONIC_TAXA_GROUP.AVES] ) ) );

    await waitFor( ( ) => expect( searchObservations ).toHaveBeenCalledTimes( 2 ) );
    expect( paramsOfLastSearch( ) ).toMatchObject( {
      iconic_taxa: [ICONIC_TAXA_GROUP.INSECTA],
      page: 1,
    } );
  } );

  it( "requests nothing while every category with observations is collapsed, and starts "
    + "loading again when one is reopened", async ( ) => {
    const { rerender, result } = renderSectionsHook( {
      collapsedCategories: new Set( [ICONIC_TAXA_GROUP.PLANTAE, ICONIC_TAXA_GROUP.AVES] ),
    } );

    await waitFor( ( ) => {
      expect( result.current.sections.get( ICONIC_TAXA_GROUP.PLANTAE ).isActivated ).toBe( false );
    } );
    expect( searchObservations ).not.toHaveBeenCalled( );

    rerender( { collapsedCategories: new Set( [ICONIC_TAXA_GROUP.AVES] ) } );

    await waitFor( ( ) => expect( searchObservations ).toHaveBeenCalledTimes( 1 ) );
    expect( paramsOfLastSearch( ) ).toMatchObject( {
      iconic_taxa: [ICONIC_TAXA_GROUP.PLANTAE],
      page: 1,
    } );
  } );

  it( "loads a section the user opens, even though the toggle that opened it calls in "
    + "with the collapsed set from before the tap", async ( ) => {
    const { rerender, result } = renderSectionsHook( {
      collapsedCategories: new Set( [ICONIC_TAXA_GROUP.PLANTAE] ),
      orderedCounts: [
        { category: ICONIC_TAXA_GROUP.PLANTAE, count: 45 },
        { category: ICONIC_TAXA_GROUP.AVES, count: 30 },
        { category: ICONIC_TAXA_GROUP.INSECTA, count: 20 },
      ],
    } );
    await waitFor( ( ) => expect( searchObservations ).toHaveBeenCalledTimes( 1 ) );
    searchObservations.mockClear( );

    // toggleCategory writes the collapsed set and calls in from the same handler, holding the
    // render it fired from, so the call lands before the reopen has re-rendered
    act( ( ) => result.current.activateCategory( ICONIC_TAXA_GROUP.PLANTAE ) );
    rerender( { collapsedCategories: new Set( ) } );

    await waitFor( ( ) => {
      expect( result.current.sections.get( ICONIC_TAXA_GROUP.PLANTAE ).isActivated ).toBe( true );
    } );
    expect( result.current.sections.get( ICONIC_TAXA_GROUP.AVES ).isActivated ).toBe( true );
  } );

  it( "takes the collapsed set from the toggle that just closed a section, so it doesn't "
    + "advance onto the section the user has closed", async ( ) => {
    const { rerender, result } = renderSectionsHook( {
      orderedCounts: [
        { category: ICONIC_TAXA_GROUP.PLANTAE, count: 45 },
        { category: ICONIC_TAXA_GROUP.AVES, count: 30 },
        { category: ICONIC_TAXA_GROUP.INSECTA, count: 20 },
      ],
    } );
    await waitFor( ( ) => expect( searchObservations ).toHaveBeenCalledTimes( 1 ) );
    searchObservations.mockClear( );

    // the user closes Aves, which it has not loaded yet
    const closed = new Set( [ICONIC_TAXA_GROUP.AVES] );
    act( ( ) => result.current.advanceFrontier( closed ) );
    rerender( { collapsedCategories: closed } );

    await waitFor( ( ) => expect( searchObservations ).toHaveBeenCalledTimes( 1 ) );
    expect( paramsOfLastSearch( ) ).toMatchObject( {
      iconic_taxa: [ICONIC_TAXA_GROUP.INSECTA],
    } );
  } );

  it( "does not request a category the server has nothing for when it is opened", async ( ) => {
    const { result } = renderSectionsHook( );
    await waitFor( ( ) => expect( searchObservations ).toHaveBeenCalledTimes( 1 ) );
    searchObservations.mockClear( );

    act( ( ) => result.current.activateCategory( ICONIC_TAXA_GROUP.INSECTA ) );

    await waitFor( ( ) => {
      expect( result.current.sections.get( ICONIC_TAXA_GROUP.INSECTA ).isActivated ).toBe( false );
    } );
    expect( searchObservations ).not.toHaveBeenCalled( );
  } );

  it( "starts over from the first category when the sort changes, rather than "
    + "re-requesting every loaded page under the new order", async ( ) => {
    const { rerender, result } = renderSectionsHook( );
    await waitFor( ( ) => expect( searchObservations ).toHaveBeenCalledTimes( 1 ) );
    act( ( ) => result.current.nearingEndOfSection( ICONIC_TAXA_GROUP.PLANTAE ) );
    await waitFor( ( ) => expect( searchObservations ).toHaveBeenCalledTimes( 2 ) );
    searchObservations.mockClear( );

    rerender( { sortBy: OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST } );

    await waitFor( ( ) => expect( searchObservations ).toHaveBeenCalledTimes( 1 ) );
    expect( paramsOfLastSearch( ) ).toMatchObject( {
      iconic_taxa: [ICONIC_TAXA_GROUP.PLANTAE],
      order_by: "observed_on",
      order: "asc",
      page: 1,
    } );
  } );

  it( "refreshes only the pages belonging to the current user and sort, so another "
    + "instance's queries aren't marked stale", async ( ) => {
    const { queryClient, result } = renderSectionsHook( );
    await waitFor( ( ) => expect( searchObservations ).toHaveBeenCalledTimes( 1 ) );
    const invalidateQueries = jest.spyOn( queryClient, "invalidateQueries" );

    act( ( ) => result.current.refreshSections( ) );

    expect( invalidateQueries ).toHaveBeenCalledWith( {
      queryKey: [QUERY_KEY, mockUser.id, { order_by: "created_at", order: "desc" }],
    } );
  } );

  it( "fails the section when its observations can't be written to Realm, rather than "
    + "rendering tiles that have nothing to hydrate from", async ( ) => {
    Observation.upsertRemoteObservations.mockImplementation( ( ) => {
      throw new Error( "realm write failed" );
    } );

    const { result } = renderSectionsHook( );

    await waitFor( ( ) => {
      expect( result.current.sections.get( ICONIC_TAXA_GROUP.PLANTAE ).isError ).toBe( true );
    } );
    expect( result.current.sections.get( ICONIC_TAXA_GROUP.PLANTAE ).uuids ).toEqual( [] );
  } );
} );
