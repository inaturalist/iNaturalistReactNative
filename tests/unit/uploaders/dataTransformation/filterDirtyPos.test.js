import factory from "tests/factory";
import filterDirtyPos from "uploaders/dataTransformation/filterDirtyPos";

const dirtyPo = ( overrides = {} ) => factory( "LocalProjectObservation", {
  needsSync: jest.fn( () => true ),
  wasSynced: jest.fn( () => false ),
  _pending_deletion: false,
  ...overrides,
} );

describe( "filterDirtyPos", () => {
  it( "includes never-synced POs that need sync", () => {
    const po = dirtyPo();
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
