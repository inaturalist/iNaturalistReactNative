import { renderHook, waitFor } from "@testing-library/react-native";
import useSyncObservations from "components/MyObservations/hooks/useSyncObservations.ts";
import inatjs from "inaturalistjs";
import safeRealmWrite from "sharedHelpers/safeRealmWrite.ts";
import {
  BEGIN_AUTOMATIC_SYNC
} from "stores/createSyncObservationsSlice.ts";
import useStore from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import faker from "tests/helpers/faker";
import setupUniqueRealm from "tests/helpers/uniqueRealm";

const initialStoreState = useStore.getState( );

const currentUserId = 1;

const syncedObservations = [
  factory( "LocalObservation", {
    _deleted_at: faker.date.past( ),
    _synced_at: faker.date.past( )
  } )
];

const unsyncedObservations = [
  factory( "LocalObservation", {
    _deleted_at: faker.date.past( ),
    _synced_at: null
  } ),
  factory( "LocalObservation", {
    _deleted_at: faker.date.past( ),
    _synced_at: null
  } )
];

const obsToDelete = unsyncedObservations[0];

const syncingStore = {
  currentDeleteCount: 1,
  deleteQueue: [obsToDelete.uuid],
  syncingStatus: BEGIN_AUTOMATIC_SYNC,
  deleteError: null,
  deletionsCompletedAt: null
};

const mockDeletedIds = [
  faker.number.int( )
];

const mockRemoteObservation = factory( "RemoteObservation", {
  taxon: factory.states( "genus" )( "RemoteTaxon" )
} );

const mockMutateAsync = jest.fn();
jest.mock( "sharedHooks/useAuthenticatedMutation", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    mutateAsync: mockMutateAsync
  } )
} ) );

const mockUpload = jest.fn( );
jest.mock( "components/MyObservations/hooks/useUploadObservations", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    startUploadObservations: mockUpload
  } )
} ) );

// UNIQUE REALM SETUP
const mockRealmIdentifier = __filename;
const { mockRealmModelsIndex, uniqueRealmBeforeAll, uniqueRealmAfterAll } = setupUniqueRealm(
  mockRealmIdentifier
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
      useQuery: ( ) => []
    }
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP

const getLocalObservation = uuid => global.mockRealms[__filename]
  .objectForPrimaryKey( "Observation", uuid );

const createObservations = ( observations, comment ) => {
  const realm = global.mockRealms[__filename];
  safeRealmWrite(
    realm,
    ( ) => {
      observations.forEach( observation => {
        realm.create( "Observation", observation );
      } );
    },
    comment
  );
};

beforeAll( async () => {
  useStore.setState( initialStoreState, true );
} );

describe( "automatic sync while user is logged out", ( ) => {
  beforeEach( () => {
    const realm = global.mockRealms[__filename];
    safeRealmWrite( realm, ( ) => {
      realm.create( "Observation", obsToDelete );
    }, "write Observation to delete, useSyncObservations.ts" );
  } );
  it( "should not fetch remote observations or deletions when user is logged out", async ( ) => {
    useStore.setState( {
      ...syncingStore
    } );
    renderHook( ( ) => useSyncObservations( null ) );
    await waitFor( ( ) => {
      expect( inatjs.observations.deleted ).not.toHaveBeenCalled( );
    } );
    await waitFor( ( ) => {
      expect( inatjs.observations.search ).not.toHaveBeenCalled( );
    } );
  } );

  it( "should delete local observations without making a server call", async ( ) => {
    const realm = global.mockRealms[__filename];
    const obsForDeletion = realm.objectForPrimaryKey( "Observation", obsToDelete.uuid );
    expect( obsForDeletion ).toBeTruthy( );
    useStore.setState( {
      ...syncingStore
    } );
    renderHook( ( ) => useSyncObservations( null ) );
    const deletedObs = realm.objectForPrimaryKey( "Observation", obsToDelete.uuid );
    await waitFor( ( ) => {
      expect( deletedObs ).toBeFalsy( );
    } );
    expect( mockMutateAsync ).not.toHaveBeenCalled( );
  } );
} );

describe( "automatic sync while user is logged in", ( ) => {
  describe( "fetch remote deletions", ( ) => {
    inatjs.observations.deleted.mockResolvedValue( makeResponse( mockDeletedIds ) );
    it( "should fetch deleted observations from server", async ( ) => {
      useStore.setState( {
        ...syncingStore
      } );
      renderHook( ( ) => useSyncObservations( currentUserId ) );
      await waitFor( ( ) => {
        expect( inatjs.observations.deleted ).toHaveBeenCalled( );
      } );
    } );
  } );

  describe( "handle local deletions", ( ) => {
    it( "should not make deletion API call for unsynced observations", async ( ) => {
      createObservations(
        unsyncedObservations,
        "write unsyncedObservations, useSyncObservations test"
      );

      const unsyncedObservation = getLocalObservation(
        unsyncedObservations[0].uuid
      );
      expect( unsyncedObservation._synced_at ).toBeNull( );
      useStore.setState( {
        ...syncingStore,
        deleteQueue: [unsyncedObservations[0].uuid]
      } );
      renderHook( ( ) => useSyncObservations( currentUserId ) );

      await waitFor( ( ) => {
        expect( mockMutateAsync ).not.toHaveBeenCalled( );
      } );
    } );

    it( "should make deletion API call for previously synced observations", async ( ) => {
      createObservations(
        syncedObservations,
        "write syncedObservations, useSyncObservations test"
      );

      const syncedObservation = getLocalObservation( syncedObservations[0].uuid );
      expect( syncedObservation._synced_at ).not.toBeNull( );
      useStore.setState( {
        ...syncingStore,
        deleteQueue: [syncedObservations[0].uuid]
      } );
      renderHook( ( ) => useSyncObservations( currentUserId ) );

      await waitFor( ( ) => {
        expect( mockMutateAsync )
          .toHaveBeenCalledWith( { uuid: syncedObservations[0].uuid } );
      } );
    } );
  } );

  it( "should fetch remote observations from server in automatic sync", async ( ) => {
    inatjs.observations.search.mockResolvedValue( makeResponse( [mockRemoteObservation] ) );
    useStore.setState( {
      ...syncingStore
    } );
    renderHook( ( ) => useSyncObservations( currentUserId ) );
    await waitFor( ( ) => {
      expect( inatjs.observations.search ).toHaveBeenCalled( );
    } );
  } );

  it( "should not create upload queue", async ( ) => {
    useStore.setState( {
      ...syncingStore
    } );
    renderHook( ( ) => useSyncObservations( currentUserId, mockUpload ) );
    await waitFor( ( ) => {
      expect( mockUpload ).not.toHaveBeenCalled( );
    } );
  } );
} );
