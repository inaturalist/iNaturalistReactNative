import {
  INVALID_NUMERIC,
  validateProjectFieldValue,
} from "sharedHelpers/validateProjectFieldsForObservation";
import factory from "tests/factory";

describe( "validateProjectFieldValue", () => {
  describe( "numeric fields", () => {
    it( "should return INVALID_NUMERIC for a non-numeric value on an optional field", () => {
      const mockPOF = factory( "LocalProjectObservationField", {
        required: false,
        obsField: factory( "LocalObservationField", {
          allowedValues: [],
          datatype: "numeric",
        } ),
      } );
      expect( validateProjectFieldValue( mockPOF, "abc" ) ).toBe( INVALID_NUMERIC );
    } );

    test.each( [
      [undefined],
      [""],
    ] )( "should return null for empty value %p on an optional numeric field", value => {
      const mockPOF = factory( "LocalProjectObservationField", {
        required: false,
        obsField: factory( "LocalObservationField", {
          allowedValues: [],
          datatype: "numeric",
        } ),
      } );
      expect( validateProjectFieldValue( mockPOF, value ) ).toBeNull( );
    } );
  } );
} );
