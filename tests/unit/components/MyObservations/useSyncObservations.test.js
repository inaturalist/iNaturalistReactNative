import { renderHook, waitFor } from "@testing-library/react-native";
import useSyncObservations from "components/MyObservations/hooks/useSyncObservations.ts";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import {
  HANDLING_LOCAL_DELETIONS
} from "stores/createSyncObservationsSlice.ts";
import useStore from "stores/useStore";
import factory from "tests/factory";
import faker from "tests/helpers/faker";

const initialStoreState = useStore.getState( );

const deletionStore = {
  currentDeleteCount: 1,
  deletions: [{}],
  syncingStatus: HANDLING_LOCAL_DELETIONS,
  deleteError: null
};

const mockMutate = jest.fn();
jest.mock( "sharedHooks/useAuthenticatedMutation", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    mutate: mockMutate
  } )
} ) );

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
  } )
];

const getLocalObservation = uuid => global.realm
  .objectForPrimaryKey( "Observation", uuid );

const createObservations = ( observations, comment ) => {
  safeRealmWrite(
    global.realm,
    ( ) => {
      observations.forEach( observation => {
        global.realm.create( "Observation", observation );
      } );
    },
    comment
  );
};

beforeAll( async () => {
  useStore.setState( initialStoreState, true );
} );

describe( "handle deletions", ( ) => {
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
      ...deletionStore,
      deletions: unsyncedObservations,
      currentDeleteCount: 1
    } );
    renderHook( ( ) => useSyncObservations( ) );

    await waitFor( ( ) => {
      expect( mockMutate ).not.toHaveBeenCalled( );
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
      ...deletionStore,
      deletions: syncedObservations,
      currentDeleteCount: 1
    } );
    renderHook( ( ) => useSyncObservations( ) );

    await waitFor( ( ) => {
      expect( mockMutate )
        .toHaveBeenCalledWith( { uuid: syncedObservations[0].uuid } );
    } );
  } );
} );
