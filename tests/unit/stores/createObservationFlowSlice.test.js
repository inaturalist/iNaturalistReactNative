import useStore from "stores/useStore";
import factory from "tests/factory";

const observation = factory( "LocalObservation" );

beforeEach( ( ) => {
  useStore.getState( ).resetObservationFlowSlice( );
} );

describe( "updateObservations", ( ) => {
  it( "marks the observation as having unsaved changes when asked to", ( ) => {
    useStore.getState( ).updateObservations( [observation], true );

    expect( useStore.getState( ).unsavedChanges ).toBe( true );
  } );

  it( "leaves unsaved changes alone by default", ( ) => {
    useStore.getState( ).updateObservations( [observation] );

    expect( useStore.getState( ).unsavedChanges ).toBe( false );
  } );

  it( "does not clear unsaved changes made earlier", ( ) => {
    useStore.getState( ).updateObservationKeys( { description: "edited" } );
    useStore.getState( ).updateObservations( [useStore.getState( ).currentObservation] );

    expect( useStore.getState( ).unsavedChanges ).toBe( true );
  } );
} );

describe( "prepareObsEdit", ( ) => {
  it( "loads an observation without marking it as having unsaved changes", ( ) => {
    useStore.getState( ).prepareObsEdit( observation );

    expect( useStore.getState( ).unsavedChanges ).toBe( false );
  } );
} );
