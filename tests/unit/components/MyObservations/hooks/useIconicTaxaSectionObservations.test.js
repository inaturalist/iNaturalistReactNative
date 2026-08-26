import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { searchObservations } from "api/observations";
import useIconicTaxaSectionObservations
  from "components/MyObservations/hooks/useIconicTaxaSectionObservations";
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

const pageOf = ( uuids, totalResults ) => ( {
  results: uuids.map( uuid => ( { uuid } ) ),
  total_results: totalResults,
} );

const renderSectionsHook = ( overrides = {} ) => {
  const queryClient = new QueryClient( {
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  } );
  const wrapper = ( { children } ) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(
    props => useIconicTaxaSectionObservations( {
      collapsedCategories: new Set( ),
      enabled: true,
      orderedCounts,
      sortBy: OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST,
      ...overrides,
      ...props,
    } ),
    { initialProps: {}, wrapper },
  );
};

const paramsOfLastSearch = ( ) => searchObservations.mock.calls.at( -1 )[0];

beforeEach( ( ) => {
  jest.clearAllMocks( );
  useCurrentUser.mockReturnValue( mockUser );
  searchObservations.mockResolvedValue( pageOf( ["a", "b"], 45 ) );
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

    act( ( ) => result.current.deepenCategory( ICONIC_TAXA_GROUP.PLANTAE ) );

    await waitFor( ( ) => expect( searchObservations ).toHaveBeenCalledTimes( 2 ) );
    expect( paramsOfLastSearch( ) ).toMatchObject( {
      iconic_taxa: [ICONIC_TAXA_GROUP.PLANTAE],
      page: 2,
    } );
  } );

  it( "starts the next category when the one the user is in has nothing left to load, "
    + "without being collapsed", async ( ) => {
    searchObservations.mockResolvedValue( pageOf( ["a"], 1 ) );
    const { result } = renderSectionsHook( );
    await waitFor( ( ) => {
      expect( result.current.sections.get( ICONIC_TAXA_GROUP.PLANTAE ).hasMore ).toBe( false );
    } );

    act( ( ) => result.current.deepenCategory( ICONIC_TAXA_GROUP.PLANTAE ) );

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
    searchObservations.mockResolvedValue( pageOf( ["a"], 1 ) );
    const { result } = renderSectionsHook( );
    await waitFor( ( ) => expect( searchObservations ).toHaveBeenCalledTimes( 1 ) );

    act( ( ) => result.current.advanceFrontier( ) );
    await waitFor( ( ) => expect( searchObservations ).toHaveBeenCalledTimes( 2 ) );
    act( ( ) => result.current.advanceFrontier( ) );

    await waitFor( ( ) => {
      expect( result.current.sections.get( ICONIC_TAXA_GROUP.INSECTA ).isActivated ).toBe( false );
    } );
    expect( searchObservations ).toHaveBeenCalledTimes( 2 );
  } );

  it( "starts over from the first category when the sort changes, rather than "
    + "re-requesting every loaded page under the new order", async ( ) => {
    const { rerender, result } = renderSectionsHook( );
    await waitFor( ( ) => expect( searchObservations ).toHaveBeenCalledTimes( 1 ) );
    act( ( ) => result.current.deepenCategory( ICONIC_TAXA_GROUP.PLANTAE ) );
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
} );
