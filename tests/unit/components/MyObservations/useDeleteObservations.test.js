import { renderHook, waitFor } from "@testing-library/react-native";
import useDeleteObservations from "components/MyObservations/hooks/useDeleteObservations";
import initI18next from "i18n/initI18next";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import factory from "tests/factory";
import faker from "tests/helpers/faker";

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

describe( "handle deletions", ( ) => {
  beforeEach( async ( ) => {
    await initI18next( );
  } );

  it( "should not make deletion API call for unsynced observations", async ( ) => {
    const deleteSpy = jest.spyOn( global.realm, "delete" );
    safeRealmWrite(
      global.realm,
      ( ) => {
        unsyncedObservations.forEach( observation => {
          global.realm.create( "Observation", observation );
        } );
      },
      "write unsyncedObservations, useDeleteObservations test"
    );

    const unsyncedObservation = getLocalObservation(
      unsyncedObservations[0].uuid
    );
    expect( unsyncedObservation._synced_at ).toBeNull( );
    renderHook( ( ) => useDeleteObservations( ) );

    await waitFor( ( ) => {
      expect( mockMutate ).not.toHaveBeenCalled( );
    } );
    expect( deleteSpy ).toHaveBeenCalled( );
  } );

  it( "should make deletion API call for previously synced observations", async ( ) => {
    const deleteSpy = jest.spyOn( global.realm, "delete" );
    safeRealmWrite(
      global.realm,
      ( ) => {
        syncedObservations.forEach( observation => {
          global.realm.create( "Observation", observation );
        } );
      },
      "write syncedObservations, useDeleteObservations test"
    );

    const syncedObservation = getLocalObservation( syncedObservations[0].uuid );
    expect( syncedObservation._synced_at ).not.toBeNull( );
    renderHook( ( ) => useDeleteObservations( ) );

    await waitFor( ( ) => {
      expect( mockMutate )
        .toHaveBeenCalledWith( { uuid: syncedObservation.uuid } );
    } );
    expect( deleteSpy ).toHaveBeenCalled( );
  } );
} );
