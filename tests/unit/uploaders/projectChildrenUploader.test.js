import factory from "tests/factory";
import {
  filterDirtyOfvs,
  filterDirtyPos,
} from "uploaders/projectChildrenUploader";

const dirtyOfv = ( overrides = {} ) => factory( "LocalObservationFieldValue", {
  id: null,
  needsSync: jest.fn( () => true ),
  wasSynced: jest.fn( () => false ),
  _pending_deletion: false,
  ...overrides,
} );

const dirtyPo = ( overrides = {} ) => factory( "LocalProjectObservation", {
  needsSync: jest.fn( () => true ),
  wasSynced: jest.fn( () => false ),
  _pending_deletion: false,
  ...overrides,
} );

describe( "projectChildrenUploader", () => {
  describe( "filterDirtyOfvs", () => {
    it( "includes unsynced OFVs with a value", () => {
      const ofv = dirtyOfv( { value: "shrubland" } );
      const observation = factory( "LocalObservation", {
        observationFieldValues: [ofv],
      } );
      expect( filterDirtyOfvs( observation ) ).toEqual( [ofv] );
    } );

    it( "excludes tombstoned and empty OFVs", () => {
      const observation = factory( "LocalObservation", {
        observationFieldValues: [
          dirtyOfv( { _pending_deletion: true, value: "x" } ),
          dirtyOfv( { value: "" } ),
          dirtyOfv( { needsSync: jest.fn( () => false ), value: "y" } ),
        ],
      } );
      expect( filterDirtyOfvs( observation ) ).toEqual( [] );
    } );
  } );

  describe( "filterDirtyPos", () => {
    it( "includes never-synced POs that need sync", () => {
      const po = dirtyPo( );
      const observation = factory( "LocalObservation", {
        projectObservations: [po],
      } );
      expect( filterDirtyPos( observation ) ).toEqual( [po] );
    } );

    it( "excludes tombstoned and already-synced POs", () => {
      const observation = factory( "LocalObservation", {
        projectObservations: [
          dirtyPo( { _pending_deletion: true } ),
          dirtyPo( { wasSynced: jest.fn( () => true ) } ),
        ],
      } );
      expect( filterDirtyPos( observation ) ).toEqual( [] );
    } );
  } );
} );
