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
  } );
} );
