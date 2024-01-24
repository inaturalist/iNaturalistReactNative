import { faker } from "@faker-js/faker";
import { renderHook, waitFor } from "@testing-library/react-native";
import useDeleteObservations from "components/MyObservations/hooks/useDeleteObservations";
import initI18next from "i18n/initI18next";
import factory from "tests/factory";

const mockMutate = jest.fn();
jest.mock( "sharedHooks/useAuthenticatedMutation", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    mutate: mockMutate
  } )
} ) );

const observationsQueuedForDeletion = [
  factory( "LocalObservation", {
    _deleted_at: faker.date.past( ),
    _synced_at: null
  } ),
  factory( "LocalObservation", {
    _deleted_at: faker.date.past( ),
    _synced_at: faker.date.past( )
  } )
];

const getLocalObservation = uuid => global.realm
  .objectForPrimaryKey( "Observation", uuid );

describe( "handle deletions", ( ) => {
  beforeEach( async ( ) => {
    await initI18next( );

    await global.realm.write( ( ) => {
      global.realm.deleteAll( );
    } );

    observationsQueuedForDeletion.forEach( observation => {
      global.realm.write( ( ) => {
        global.realm.create( "Observation", observation );
      } );
    } );
  } );

  it( "should make deletion API call for previously synced observations", async ( ) => {
    const unsyncedObservation = getLocalObservation( observationsQueuedForDeletion[0].uuid );
    expect( unsyncedObservation._synced_at ).toBeNull( );
    const syncedObservation = getLocalObservation( observationsQueuedForDeletion[1].uuid );
    expect( syncedObservation._synced_at ).not.toBeNull( );
    renderHook( ( ) => useDeleteObservations( ) );

    await waitFor( ( ) => {
      expect( mockMutate )
        .not.toHaveBeenCalledWith( { uuid: unsyncedObservation.uuid } );
    } );
    expect( mockMutate )
      .toHaveBeenCalledWith( { uuid: syncedObservation.uuid } );
  } );

  // it( "should locally delete all observations", async ( ) => {
  //   const unsyncedObservation = getLocalObservation( observationsQueuedForDeletion[0].uuid );
  //   expect( unsyncedObservation._synced_at ).toBeNull( );
  //   const syncedObservation = getLocalObservation( observationsQueuedForDeletion[1].uuid );
  //   expect( syncedObservation._synced_at ).not.toBeNull( );
  //   renderHook( ( ) => useDeleteObservations( ) );

  //   const spy = jest.spyOn( global.realm, "delete" );

  //   await waitFor( ( ) => {
  //     expect( spy ).toHaveBeenCalledTimes( 2 );
  //   } );
  // } );
} );
