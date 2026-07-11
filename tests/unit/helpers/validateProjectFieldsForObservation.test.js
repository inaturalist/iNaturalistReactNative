import {
  INVALID_NUMERIC,
  validateProjectFieldValue,
} from "sharedHelpers/validateProjectFieldsForObservation";
import factory from "tests/factory";

describe( "validateProjectFieldValue", () => {
  describe( "required fields", () => {
    it( "should return null for a non-empty value", () => {
      const mockPOF = factory( "LocalProjectObservationField", {
        required: true,
        obsField: factory( "LocalObservationField", {
          allowedValues: [],
        } ),
      } );
      expect( validateProjectFieldValue( mockPOF, "x" ) ).toBeNull( );
    } );

    it( "should return null for a value that is non-empty after trim", () => {
      const mockPOF = factory( "LocalProjectObservationField", {
        required: true,
        obsField: factory( "LocalObservationField", {
          allowedValues: [],
        } ),
      } );
      expect( validateProjectFieldValue( mockPOF, " x " ) ).toBeNull( );
    } );
  } );

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

  describe( "optional text fields", () => {
    test.each( [
      [undefined],
      [""],
      ["anything"],
    ] )( "should return null for %p", value => {
      const mockPOF = factory( "LocalProjectObservationField", {
        required: false,
        obsField: factory( "LocalObservationField", {
          allowedValues: [],
        } ),
      } );
      expect( validateProjectFieldValue( mockPOF, value ) ).toBeNull( );
    } );
  } );
} );
