import { renderHook } from "@testing-library/react-native";
import useMyObservationsQuery from "components/MyObservations/hooks/useMyObservationsQuery";
import useServerOrderedObservations
  from "components/MyObservations/hooks/useServerOrderedObservations";
import { useMyObservations } from "providers/MyObservationsContext";
import { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import factory from "tests/factory";
import setupUniqueRealm from "tests/helpers/uniqueRealm";

jest.mock( "components/MyObservations/hooks/useServerOrderedObservations", ( ) => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );

jest.mock( "providers/MyObservationsContext", ( ) => ( {
  __esModule: true,
  useMyObservations: jest.fn( ),
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
      useQuery: ( { type, query } ) => {
        const realm = global.mockRealms[mockRealmIdentifier];
        const results = realm.objects( type );
        return query
          ? query( results )
          : results;
      },
    },
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP

const createObservation = observation => {
  const realm = global.mockRealms[mockRealmIdentifier];
  safeRealmWrite( realm, ( ) => {
    realm.create( "Observation", observation, "modified" );
  }, "create test observation for useMyObservationsQuery" );
};

const defaultServerResult = {
  observationIds: [],
  isLoading: false,
  isFetchingNextPage: false,
  error: null,
  fetchNextPage: jest.fn( ),
  refetch: jest.fn( ),
};

beforeEach( ( ) => {
  // clear leftover state from previous test
  const realm = global.mockRealms[mockRealmIdentifier];
  safeRealmWrite( realm, ( ) => {
    realm.deleteAll( );
  }, "clear realm before each useMyObservationsQuery test" );
  useServerOrderedObservations.mockReturnValue( defaultServerResult );
} );

afterEach( ( ) => {
  jest.clearAllMocks( );
} );

describe( "useMyObservationsQuery", ( ) => {
  it( "uses the local Realm manifest for the default sort, ignoring server results "
    + "and suppressing server loading/error/refetch since that query is disabled", ( ) => {
    useMyObservations.mockReturnValue( {
      state: { observationsSort: OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST },
    } );
    const serverRefetch = jest.fn( );
    const serverFetchNextPage = jest.fn( );
    useServerOrderedObservations.mockReturnValue( {
      observationIds: [{ uuid: "should-be-ignored-in-default-sort" }],
      isLoading: true,
      isFetchingNextPage: true,
      error: new Error( "should be suppressed for default sort" ),
      refetch: serverRefetch,
      fetchNextPage: serverFetchNextPage,
    } );
    const localObs = factory( "LocalObservation", { needs_sync: false } );
    createObservation( localObs );

    const { result } = renderHook( ( ) => useMyObservationsQuery( ) );

    expect( result.current.observationIds ).toEqual( [{ uuid: localObs.uuid }] );
    expect( result.current.isServerAuthoritative ).toEqual( false );
    expect( result.current.isLoading ).toEqual( false );
    expect( result.current.isFetchingNextPage ).toEqual( false );
    expect( result.current.error ).toBeNull( );
    expect( result.current.refetch ).not.toBe( serverRefetch );
    expect( result.current.fetchNextPage ).not.toBe( serverFetchNextPage );
    expect( useServerOrderedObservations ).toHaveBeenCalledWith(
      expect.objectContaining( { enabled: false } ),
    );
  } );

  it( "prepends unsynced local observations ahead of server results for non-default sort", ( ) => {
    useMyObservations.mockReturnValue( {
      state: { observationsSort: OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST },
    } );
    const serverObs = { uuid: factory( "LocalObservation" ).uuid };
    const serverFetchNextPage = jest.fn( );
    useServerOrderedObservations.mockReturnValue( {
      ...defaultServerResult,
      observationIds: [serverObs],
      isFetchingNextPage: true,
      fetchNextPage: serverFetchNextPage,
    } );
    const unsyncedObs = factory( "LocalObservation", { needs_sync: true } );
    createObservation( unsyncedObs );

    const { result } = renderHook( ( ) => useMyObservationsQuery( ) );

    expect( result.current.observationIds ).toEqual( [
      { uuid: unsyncedObs.uuid },
      serverObs,
    ] );
    expect( result.current.isServerAuthoritative ).toEqual( true );
    expect( result.current.isFetchingNextPage ).toEqual( true );
    expect( result.current.fetchNextPage ).toBe( serverFetchNextPage );
    expect( useServerOrderedObservations ).toHaveBeenCalledWith(
      expect.objectContaining( { enabled: true } ),
    );
  } );

  it( "dedupes an observation that is both unsynced locally and present in server results", ( ) => {
    useMyObservations.mockReturnValue( {
      state: { observationsSort: OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST },
    } );
    const unsyncedObs = factory( "LocalObservation", { needs_sync: true } );
    const otherServerObs = { uuid: factory( "LocalObservation" ).uuid };
    useServerOrderedObservations.mockReturnValue( {
      ...defaultServerResult,
      observationIds: [{ uuid: unsyncedObs.uuid }, otherServerObs],
    } );
    createObservation( unsyncedObs );

    const { result } = renderHook( ( ) => useMyObservationsQuery( ) );

    expect( result.current.observationIds ).toEqual( [
      { uuid: unsyncedObs.uuid },
      otherServerObs,
    ] );
  } );
} );
