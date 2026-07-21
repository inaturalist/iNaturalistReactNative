import { renderHook } from "@testing-library/react-native";
import useServerOrderedObservations
  from "components/MyObservations/hooks/useServerOrderedObservations";
import inatjs from "inaturalistjs";
import { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import useAuthenticatedInfiniteQuery from "sharedHooks/useAuthenticatedInfiniteQuery";
import useCurrentUser from "sharedHooks/useCurrentUser";
import factory, { makeResponse } from "tests/factory";
import setupUniqueRealm from "tests/helpers/uniqueRealm";

const mockUser = factory( "LocalUser" );

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );

jest.mock( "sharedHooks/useAuthenticatedInfiniteQuery", ( ) => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );

// UNIQUE REALM SETUP
const mockRealmIdentifier = __filename;
const { mockRealmModelsIndex, uniqueRealmBeforeAll, uniqueRealmAfterAll } = setupUniqueRealm(
  mockRealmIdentifier,
);
jest.mock( "realmModels/index", ( ) => mockRealmModelsIndex );
jest.mock( "providers/contexts", ( ) => {
  const originalModule = jest.requireActual( "providers/contexts" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      useRealm: ( ) => global.mockRealms[mockRealmIdentifier],
    },
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP

const getRealm = ( ) => global.mockRealms[mockRealmIdentifier];
const getLocalObservation = uuid => getRealm( ).objectForPrimaryKey( "Observation", uuid );

const defaultQueryResult = {
  data: undefined,
  isLoading: false,
  isFetchingNextPage: false,
  error: null,
  fetchNextPage: jest.fn( ),
  refetch: jest.fn( ),
};

beforeEach( ( ) => {
  useCurrentUser.mockReturnValue( mockUser );
  useAuthenticatedInfiniteQuery.mockReturnValue( defaultQueryResult );
} );

afterEach( ( ) => {
  jest.clearAllMocks( );
} );

describe( "useServerOrderedObservations", ( ) => {
  it( "scopes API params to the current user and bypasses response caching", ( ) => {
    renderHook( ( ) => useServerOrderedObservations( {
      sortBy: OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST,
    } ) );

    const [queryKey] = useAuthenticatedInfiniteQuery.mock.calls[0];
    const [, params] = queryKey;
    expect( params ).toEqual( expect.objectContaining( {
      user_id: mockUser.id,
      ttl: -1,
    } ) );
  } );

  it( "disables the query when enabled is false or there is no current user", ( ) => {
    const { rerender } = renderHook(
      props => useServerOrderedObservations( props ),
      { initialProps: { sortBy: OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST, enabled: false } },
    );
    expect( useAuthenticatedInfiniteQuery.mock.calls[0][2].enabled ).toEqual( false );

    useCurrentUser.mockReturnValue( null );
    rerender( { sortBy: OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST, enabled: true } );
    expect( useAuthenticatedInfiniteQuery.mock.calls[1][2].enabled ).toEqual( false );
  } );

  it( "flattens uuid-only data across pages and passes through pagination metadata", ( ) => {
    const mockRefetch = jest.fn( );
    const mockFetchNextPage = jest.fn( );
    useAuthenticatedInfiniteQuery.mockReturnValue( {
      data: {
        pages: [
          { results: [{ uuid: "a" }, { uuid: "b" }], total_results: 3, page: 1 },
          { results: [{ uuid: "c" }], total_results: 3, page: 2 },
        ],
      },
      isLoading: false,
      isFetchingNextPage: true,
      error: null,
      fetchNextPage: mockFetchNextPage,
      refetch: mockRefetch,
    } );

    const { result } = renderHook( ( ) => useServerOrderedObservations( {
      sortBy: OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST,
    } ) );

    expect( result.current.observationIds ).toEqual( [
      { uuid: "a" }, { uuid: "b" }, { uuid: "c" },
    ] );
    expect( result.current.totalResults ).toEqual( 3 );
    expect( result.current.isFetchingNextPage ).toEqual( true );
    expect( result.current.fetchNextPage ).toEqual( mockFetchNextPage );
    expect( result.current.refetch ).toEqual( mockRefetch );
  } );

  it( "requests the next page via pageParam and upserts fetched results into Realm", async ( ) => {
    const remoteObservation = factory( "RemoteObservation" );
    inatjs.observations.search.mockResolvedValueOnce( makeResponse( [remoteObservation] ) );

    renderHook( ( ) => useServerOrderedObservations( {
      sortBy: OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST,
    } ) );

    const [, queryFunction] = useAuthenticatedInfiniteQuery.mock.calls[0];
    const data = await queryFunction( { pageParam: 2 }, { api_token: "fake-token" } );

    expect( inatjs.observations.search ).toHaveBeenCalledWith(
      expect.objectContaining( { page: 2 } ),
      expect.anything( ),
    );
    expect( data.results ).toEqual( [remoteObservation] );
    const localObs = getLocalObservation( remoteObservation.uuid );
    expect( localObs ).toBeTruthy( );
    expect( localObs.id ).toEqual( remoteObservation.id );
  } );

  describe( "getNextPageParam", ( ) => {
    it( "requests the next page until all results have been fetched", ( ) => {
      renderHook( ( ) => useServerOrderedObservations( {
        sortBy: OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST,
      } ) );

      const { getNextPageParam } = useAuthenticatedInfiniteQuery.mock.calls[0][2];
      expect( getNextPageParam( { page: 1, total_results: 45 } ) ).toEqual( 2 );
      expect( getNextPageParam( { page: 3, total_results: 45 } ) ).toBeNull( );
    } );
  } );
} );
