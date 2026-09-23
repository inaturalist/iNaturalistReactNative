import useStore from "stores/useStore";
import factory from "tests/factory";

const observation = factory( "LocalObservation" );

beforeEach( ( ) => {
  useStore.getState( ).resetObservationFlowSlice( );
} );

describe( "updateObservations", ( ) => {
  it( "does not mark the observation as having unsaved changes", ( ) => {
    useStore.getState( ).updateObservations( [observation] );

    expect( useStore.getState( ).unsavedChanges ).toBe( false );
  } );

  it( "does not clear unsaved changes made earlier", ( ) => {
    useStore.getState( ).updateObservationKeys( { description: "edited" } );
    useStore.getState( ).updateObservations( [useStore.getState( ).currentObservation] );

    expect( useStore.getState( ).unsavedChanges ).toBe( true );
  } );
} );

describe( "updateCurrentObservation", ( ) => {
  const observations = [
    factory( "LocalObservation" ),
    factory( "LocalObservation" ),
  ];

  beforeEach( ( ) => {
    useStore.getState( ).updateObservations( observations );
    useStore.getState( ).setCurrentObservationIndex( 1 );
  } );

  it( "replaces only the current observation", ( ) => {
    const updatedObservation = { ...observations[1], description: "edited" };
    useStore.getState( ).updateCurrentObservation( updatedObservation );

    const state = useStore.getState( );
    expect( state.observations ).toEqual( [observations[0], updatedObservation] );
    expect( state.currentObservation ).toEqual( updatedObservation );
  } );

  it( "marks the observation as having unsaved changes", ( ) => {
    useStore.getState( ).updateCurrentObservation( observations[1] );

    expect( useStore.getState( ).unsavedChanges ).toBe( true );
  } );
} );

describe( "prepareObsEdit", ( ) => {
  it( "loads an observation without marking it as having unsaved changes", ( ) => {
    useStore.getState( ).prepareObsEdit( observation );

    expect( useStore.getState( ).unsavedChanges ).toBe( false );
  } );
} );

describe( "removeCurrentObservation", ( ) => {
  const observations = [
    factory( "LocalObservation" ),
    factory( "LocalObservation" ),
    factory( "LocalObservation" ),
  ];

  function removeObservationAt( index ) {
    useStore.getState( ).updateObservations( observations );
    useStore.getState( ).setCurrentObservationIndex( index );
    useStore.getState( ).removeCurrentObservation( );
    return useStore.getState( );
  }

  it( "shows the next observation after removing one from the middle", ( ) => {
    const state = removeObservationAt( 1 );

    expect( state.observations.map( o => o.uuid ) )
      .toEqual( [observations[0].uuid, observations[2].uuid] );
    expect( state.currentObservationIndex ).toBe( 1 );
    expect( state.currentObservation.uuid ).toBe( observations[2].uuid );
  } );

  it( "shows the previous observation after removing the last one", ( ) => {
    const state = removeObservationAt( 2 );

    expect( state.observations.map( o => o.uuid ) )
      .toEqual( [observations[0].uuid, observations[1].uuid] );
    expect( state.currentObservationIndex ).toBe( 1 );
    expect( state.currentObservation.uuid ).toBe( observations[1].uuid );
  } );

  it( "does not mutate the previous observations array", ( ) => {
    useStore.getState( ).updateObservations( observations );
    const previousObservations = useStore.getState( ).observations;
    useStore.getState( ).removeCurrentObservation( );

    expect( previousObservations ).toHaveLength( 3 );
  } );
} );
