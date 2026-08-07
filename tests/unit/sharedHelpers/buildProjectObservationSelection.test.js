import buildProjectObservationSelection, {
  areProjectIdSetsEqual,
} from "sharedHelpers/buildProjectObservationSelection";
import factory from "tests/factory";

describe( "areProjectIdSetsEqual", ( ) => {
  it( "returns true for sets with the same project ids", ( ) => {
    expect( areProjectIdSetsEqual( new Set( [1, 2] ), new Set( [2, 1] ) ) ).toBe( true );
  } );

  it( "returns false when project ids differ", ( ) => {
    expect( areProjectIdSetsEqual( new Set( [1] ), new Set( [1, 2] ) ) ).toBe( false );
  } );

  describe( "buildProjectObservationSelection", ( ) => {
    it( "preserves existing PO metadata when re-selected", ( ) => {
      const existingPo = factory( "LocalProjectObservation", {
        projectId: 10,
        uuid: "existing-po-uuid",
        id: 99,
        _synced_at: new Date( ),
      } );

      const result = buildProjectObservationSelection(
        [existingPo],
        new Set( [10] ),
      );

      expect( result.projectObservations ).toEqual( [existingPo] );
    } );

    it( "creates a new PO for newly selected projects", ( ) => {
      const result = buildProjectObservationSelection( [], new Set( [42] ) );

      expect( result.projectObservations ).toHaveLength( 1 );
      expect( result.projectObservations[0].projectId ).toBe( 42 );
      expect( result.projectObservations[0].uuid ).toBeTruthy( );
    } );

    it( "soft-deletes synced POs when deselected during an ObsEdit session", ( ) => {
      const syncedPo = factory( "LocalProjectObservation", {
        projectId: 10,
        uuid: "synced-po-uuid",
        _synced_at: new Date( ),
      } );

      const result = buildProjectObservationSelection(
        [syncedPo],
        new Set( ),
      );

      expect( result.projectObservations ).toEqual( [{
        ...syncedPo,
        _pendingRemoval: true,
      }] );
    } );

    it( "drops never-synced POs without staging deletion", ( ) => {
      const unsyncedPo = factory( "LocalProjectObservation", {
        projectId: 10,
        uuid: "unsynced-po-uuid",
      } );

      const result = buildProjectObservationSelection(
        [unsyncedPo],
        new Set( ),
      );

      expect( result.projectObservations ).toEqual( [] );
    } );

    it( "preserves uuid when re-selecting after soft-delete", ( ) => {
      const deselectedPo = factory( "LocalProjectObservation", {
        projectId: 10,
        uuid: "reselected-po-uuid",
        id: 99,
        _synced_at: new Date( ),
        _pendingRemoval: true,
      } );

      const result = buildProjectObservationSelection(
        [deselectedPo],
        new Set( [10] ),
      );

      expect( result.projectObservations ).toEqual( [expect.objectContaining( {
        projectId: 10,
        uuid: "reselected-po-uuid",
        id: 99,
        _synced_at: deselectedPo._synced_at,
      } )] );
    } );

    it( "clears pending deletion when re-selecting a tombstoned PO", ( ) => {
      const tombstonedPo = factory( "LocalProjectObservation", {
        projectId: 10,
        uuid: "tombstoned-po-uuid",
        id: 99,
        _synced_at: new Date( ),
        _pending_deletion: true,
      } );

      const result = buildProjectObservationSelection(
        [tombstonedPo],
        new Set( [10] ),
      );

      expect( result.projectObservations[0] ).toEqual( expect.objectContaining( {
        projectId: 10,
        uuid: "tombstoned-po-uuid",
        id: 99,
        _synced_at: tombstonedPo._synced_at,
      } ) );
      expect( result.projectObservations[0]._pending_deletion ).toBeUndefined( );
    } );

    it( "keeps other pending-removal POs when selection changes", ( ) => {
      const activePo = factory( "LocalProjectObservation", {
        projectId: 10,
        uuid: "active-po-uuid",
        _synced_at: new Date( ),
      } );
      const pendingRemovalPo = factory( "LocalProjectObservation", {
        projectId: 20,
        uuid: "pending-removal-po-uuid",
        _synced_at: new Date( ),
        _pendingRemoval: true,
      } );

      const result = buildProjectObservationSelection(
        [activePo, pendingRemovalPo],
        new Set( [10] ),
      );

      expect( result.projectObservations ).toEqual( [
        activePo,
        {
          ...pendingRemovalPo,
          _pendingRemoval: true,
        },
      ] );
    } );

    it( "handles missing arrays on brand-new observations", ( ) => {
      const result = buildProjectObservationSelection(
        undefined,
        new Set( [5] ),
      );

      expect( result.projectObservations ).toHaveLength( 1 );
      expect( result.projectObservations[0].projectId ).toBe( 5 );
    } );
  } );
} );
