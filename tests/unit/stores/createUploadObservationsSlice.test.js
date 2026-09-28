import useStore from "stores/useStore";
import factory from "tests/factory";

const dirtyPo = ( overrides = {} ) => factory( "LocalProjectObservation", {
  needsSync: jest.fn( () => true ),
  wasSynced: jest.fn( () => false ),
  _pending_deletion: false,
  ...overrides,
} );

const unsyncedObsPhoto = ( overrides = {} ) => factory( "LocalObservationPhoto", {
  wasSynced: jest.fn( () => false ),
  ...overrides,
} );

const syncedObsPhoto = ( overrides = {} ) => factory( "LocalObservationPhoto", {
  wasSynced: jest.fn( () => true ),
  needsSync: jest.fn( () => true ),
  ...overrides,
} );

beforeEach( () => {
  useStore.getState().resetUploadObservationsSlice( );
} );

describe( "setTotalToolbarIncrements", ( ) => {
  it( "counts 1 for an observation with no media or project attachments", ( ) => {
    const observation = factory( "LocalObservation", {
      observationPhotos: [],
      observationSounds: [],
      projectObservations: [],
    } );

    useStore.getState().setTotalToolbarIncrements( [observation] );

    expect( useStore.getState().totalToolbarIncrements ).toBe( 1 );
  } );

  it( "adds 1 increment when one dirty project observation needs upload", ( ) => {
    const observation = factory( "LocalObservation", {
      observationPhotos: [],
      observationSounds: [],
      projectObservations: [dirtyPo( )],
    } );

    useStore.getState().setTotalToolbarIncrements( [observation] );

    expect( useStore.getState().totalToolbarIncrements ).toBe( 2 );
  } );

  it( "adds only 1 increment for multiple dirty project observations", ( ) => {
    const observation = factory( "LocalObservation", {
      observationPhotos: [],
      observationSounds: [],
      projectObservations: [
        dirtyPo( { projectId: 508 } ),
        dirtyPo( { projectId: 509 } ),
      ],
    } );

    useStore.getState().setTotalToolbarIncrements( [observation] );

    expect( useStore.getState().totalToolbarIncrements ).toBe( 2 );
  } );

  it( "does not count synced or tombstoned project observations", ( ) => {
    const observation = factory( "LocalObservation", {
      observationPhotos: [],
      observationSounds: [],
      projectObservations: [
        dirtyPo( { wasSynced: jest.fn( () => true ) } ),
        dirtyPo( { _pending_deletion: true } ),
      ],
    } );

    useStore.getState().setTotalToolbarIncrements( [observation] );

    expect( useStore.getState().totalToolbarIncrements ).toBe( 1 );
  } );

  it( "adds 1 increment per unsynced observation photo", ( ) => {
    const observation = factory( "LocalObservation", {
      observationPhotos: [unsyncedObsPhoto( )],
      observationSounds: [],
      projectObservations: [],
    } );

    useStore.getState().setTotalToolbarIncrements( [observation] );

    expect( useStore.getState().totalToolbarIncrements ).toBe( 2 );
  } );

  it( "adds 1 increment per each unsynced observation photo", ( ) => {
    const observation = factory( "LocalObservation", {
      observationPhotos: [
        unsyncedObsPhoto( ),
        unsyncedObsPhoto( ),
      ],
      observationSounds: [],
      projectObservations: [],
    } );

    useStore.getState().setTotalToolbarIncrements( [observation] );

    expect( useStore.getState().totalToolbarIncrements ).toBe( 3 );
  } );

  it( "adds half an increment for a previously synced observation photo", ( ) => {
    const observation = factory( "LocalObservation", {
      observationPhotos: [syncedObsPhoto( )],
      observationSounds: [],
      projectObservations: [],
    } );

    useStore.getState().setTotalToolbarIncrements( [observation] );

    expect( useStore.getState().totalToolbarIncrements ).toBe( 1.5 );
  } );
} );
