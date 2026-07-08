import { renderHook, waitFor } from "@testing-library/react-native";
import useServerOrderedObservations
  from "components/MyObservations/hooks/useServerOrderedObservations";
import { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useCurrentUser from "sharedHooks/useCurrentUser";
import factory from "tests/factory";
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

  it( "maps fetched results to a uuid-only list and passes through query metadata", ( ) => {
    const mockRefetch = jest.fn( );
    const remoteObservations = [
      factory( "RemoteObservation" ),
      factory( "RemoteObservation" ),
    ];
    useAuthenticatedQuery.mockReturnValue( {
      data: { results: remoteObservations, total_results: 2 },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    } );

    const { result } = renderHook( ( ) => useServerOrderedObservations( {
      sortBy: OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST,
    } ) );

    expect( result.current.observationIds ).toEqual( [
      { uuid: remoteObservations[0].uuid },
      { uuid: remoteObservations[1].uuid },
    ] );
    expect( result.current.totalResults ).toEqual( 2 );
    expect( result.current.refetch ).toEqual( mockRefetch );
  } );

  it( "upserts newly fetched results into Realm", async ( ) => {
    const remoteObservation = factory( "RemoteObservation" );
    useAuthenticatedQuery.mockReturnValue( {
      data: { results: [remoteObservation], total_results: 1 },
      isLoading: false,
      error: null,
      refetch: jest.fn( ),
    } );

    renderHook( ( ) => useServerOrderedObservations( {
      sortBy: OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST,
    } ) );

    await waitFor( ( ) => {
      const localObs = getLocalObservation( remoteObservation.uuid );
      expect( localObs ).toBeTruthy( );
      expect( localObs.id ).toEqual( remoteObservation.id );
    } );
  } );
} );
