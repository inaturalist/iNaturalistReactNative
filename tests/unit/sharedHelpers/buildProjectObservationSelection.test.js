import buildProjectObservationSelection, {
  areProjectIdSetsEqual,
} from "sharedHelpers/buildProjectObservationSelection";

console.log( "buildProjectObservationSelection", buildProjectObservationSelection );
describe( "areProjectIdSetsEqual", ( ) => {
  it( "returns true for sets with the same project ids", ( ) => {
    expect( areProjectIdSetsEqual( new Set( [1, 2] ), new Set( [2, 1] ) ) ).toBe( true );
  } );

  it( "returns false when project ids differ", ( ) => {
    expect( areProjectIdSetsEqual( new Set( [1] ), new Set( [1, 2] ) ) ).toBe( false );
  } );
} );
