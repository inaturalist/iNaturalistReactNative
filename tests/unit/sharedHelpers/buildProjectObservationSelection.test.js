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
        [],
        new Set( [10] ),
      );

      expect( result.projectObservations ).toEqual( [existingPo] );
      expect( result.projectObservationUuidsToDelete ).toEqual( [] );
    } );

    it( "creates a new PO for newly selected projects", ( ) => {
      const result = buildProjectObservationSelection( [], [], new Set( [42] ) );

      expect( result.projectObservations ).toHaveLength( 1 );
      expect( result.projectObservations[0].projectId ).toBe( 42 );
      expect( result.projectObservations[0].uuid ).toBeTruthy( );
      expect( result.projectObservationUuidsToDelete ).toEqual( [] );
    } );

    it( "stages synced PO uuids when deselected during an ObsEdit session", ( ) => {
      const syncedPo = factory( "LocalProjectObservation", {
        projectId: 10,
        uuid: "synced-po-uuid",
        _synced_at: new Date( ),
      } );

      const result = buildProjectObservationSelection(
        [syncedPo],
        [],
        new Set( ),
      );

      expect( result.projectObservations ).toEqual( [] );
      expect( result.projectObservationUuidsToDelete ).toEqual( ["synced-po-uuid"] );
    } );

    it( "drops never-synced POs without staging deletion", ( ) => {
      const unsyncedPo = factory( "LocalProjectObservation", {
        projectId: 10,
        uuid: "unsynced-po-uuid",
      } );

      const result = buildProjectObservationSelection(
        [unsyncedPo],
        [],
        new Set( ),
      );

      expect( result.projectObservations ).toEqual( [] );
      expect( result.projectObservationUuidsToDelete ).toEqual( [] );

      // TODO: MOB-1508 test that the local realm PO get's deleted in this case
    } );
  } );
} );
