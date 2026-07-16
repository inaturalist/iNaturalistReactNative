import { renderHook } from "@testing-library/react-native";
import useServerOrderedObservations
  from "components/MyObservations/hooks/useServerOrderedObservations";
import inatjs from "inaturalistjs";
import { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useCurrentUser from "sharedHooks/useCurrentUser";
import factory, { makeResponse } from "tests/factory";
import setupUniqueRealm from "tests/helpers/uniqueRealm";

const mockUser = factory( "LocalUser" );

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
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
  error: null,
  refetch: jest.fn( ),
};

beforeEach( ( ) => {
  useCurrentUser.mockReturnValue( mockUser );
  useAuthenticatedQuery.mockReturnValue( defaultQueryResult );
} );

afterEach( ( ) => {
  jest.clearAllMocks( );
} );

describe( "useServerOrderedObservations", ( ) => {
  it( "scopes API params to the current user and bypasses response caching", ( ) => {
    renderHook( ( ) => useServerOrderedObservations( {
      sortBy: OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST,
    } ) );

    const [queryKey] = useAuthenticatedQuery.mock.calls[0];
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
    expect( useAuthenticatedQuery.mock.calls[0][2].enabled ).toEqual( false );

    useCurrentUser.mockReturnValue( null );
    rerender( { sortBy: OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST, enabled: true } );
    expect( useAuthenticatedQuery.mock.calls[1][2].enabled ).toEqual( false );
  } );

  it( "passes through the query's uuid-only data and metadata as-is", ( ) => {
    const mockRefetch = jest.fn( );
    useAuthenticatedQuery.mockReturnValue( {
      data: { observationIds: [{ uuid: "a" }, { uuid: "b" }], totalResults: 2 },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    } );

    const { result } = renderHook( ( ) => useServerOrderedObservations( {
      sortBy: OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST,
    } ) );

    expect( result.current.observationIds ).toEqual( [{ uuid: "a" }, { uuid: "b" }] );
    expect( result.current.totalResults ).toEqual( 2 );
    expect( result.current.refetch ).toEqual( mockRefetch );
  } );

  it( "queryFn upserts fetched results into Realm and returns a uuid-only list", async ( ) => {
    const remoteObservation = factory( "RemoteObservation" );
    inatjs.observations.search.mockResolvedValueOnce( makeResponse( [remoteObservation] ) );

    renderHook( ( ) => useServerOrderedObservations( {
      sortBy: OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST,
    } ) );

    const [, queryFunction] = useAuthenticatedQuery.mock.calls[0];
    const data = await queryFunction( { api_token: "fake-token" } );

    expect( data ).toEqual( {
      observationIds: [{ uuid: remoteObservation.uuid }],
      totalResults: 1,
    } );
    const localObs = getLocalObservation( remoteObservation.uuid );
    expect( localObs ).toBeTruthy( );
    expect( localObs.id ).toEqual( remoteObservation.id );
  } );
} );
