import validateProjectFieldsForObservation, {
  INVALID_NUMERIC,
  MISSING_REQUIRED,
  validateProjectFieldValue,
} from "sharedHelpers/validateProjectFieldsForObservation";
import factory from "tests/factory";

describe( "validateProjectFieldValue", () => {
  describe( "required fields", () => {
    test.each( [
      [undefined],
      [null],
      [""],
      ["   "],
    ] )( "should return MISSING_REQUIRED for empty value %p", value => {
      const mockPOF = factory( "LocalProjectObservationField", {
        required: true,
        obsField: factory( "LocalObservationField", {
          allowedValues: [],
        } ),
      } );
      expect( validateProjectFieldValue( mockPOF, value ) ).toBe( MISSING_REQUIRED );
    } );

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

describe( "validateProjectFieldsForObservation", () => {
  describe( "required fields", () => {
    test.each( [
      [""],
      ["   "],
    ] )( "should return MISSING_REQUIRED when a required field's OFV value is %p", value => {
      const mockProject = {
        projectObservationFields: [{
          required: true,
          obsField: {
            allowedValues: [],
            id: 10,
          },
        }],
      };
      const mockObservation = {
        observationFieldValues: [{ id: 10, value }],
      };
      const result = validateProjectFieldsForObservation( mockObservation, [mockProject] );
      expect( result.valid ).toBe( false );
      expect( result.errors[0].reason ).toBe( MISSING_REQUIRED );
    } );

    it( "should be valid when a required field's OFV is non-empty after trim", () => {
      const mockProject = {
        projectObservationFields: [{
          required: true,
          obsField: {
            allowedValues: [],
            id: 10,
          },
        }],
      };
      const mockObservation = {
        observationFieldValues: [{
          obsFieldId: 10,
          value: "something",
        }],
      };
      expect(
        validateProjectFieldsForObservation( mockObservation, [mockProject] ).valid,
      ).toBe( true );
    } );

    it( "should be valid when an optional field has no OFV", () => {
      const mockProject = {
        projectObservationFields: [{
          required: false,
          obsField: {
            allowedValues: [],
            id: 10,
          },
        }],
      };
      const mockObservation = { observationFieldValues: [] };
      expect(
        validateProjectFieldsForObservation( mockObservation, [mockProject] ).valid,
      ).toBe( true );
    } );
  } );
} );
