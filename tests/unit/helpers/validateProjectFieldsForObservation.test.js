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
    it( "should be valid when a required field has a non-empty OFV", () => {
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
        observationFieldValues: [{ obsFieldId: 10, value: "shrubland" }],
      };
      const result = validateProjectFieldsForObservation( mockObservation, [mockProject] );
      expect( result.valid ).toBe( true );
      expect( result.errors ).toEqual( [] );
    } );

    it( "should return MISSING_REQUIRED when a required field has no OFV", () => {
      const mockProject = {
        title: "Mushrooms of Bavaria",
        projectObservationFields: [{
          required: true,
          obsField: {
            allowedValues: [],
            id: 10,
            name: "Habitat",
          },
        }],
      };
      const mockObservation = { observationFieldValues: [] };
      const result = validateProjectFieldsForObservation( mockObservation, [mockProject] );
      expect( result.valid ).toBe( false );
      expect( result.errors ).toEqual( [{
        projectId: mockProject.id,
        projectTitle: "Mushrooms of Bavaria",
        obsFieldId: 10,
        fieldName: "Habitat",
        reason: MISSING_REQUIRED,
      }] );
    } );

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
        observationFieldValues: [{ obsFieldId: 10, value }],
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

    it( "should report only the unfilled field when one of two required fields is filled", () => {
      const mockProject = {
        projectObservationFields: [
          {
            required: true,
            obsField: {
              allowedValues: [],
              id: 10,
              name: "Habitat",
            },
          },
          {
            required: true,
            obsField: {
              allowedValues: [],
              id: 20,
              name: "Substrate",
            },
          },
        ],
      };
      const mockObservation = {
        observationFieldValues: [{ obsFieldId: 10, value: "shrubland" }],
      };
      const result = validateProjectFieldsForObservation( mockObservation, [mockProject] );
      expect( result.valid ).toBe( false );
      expect( result.errors ).toHaveLength( 1 );
      expect( result.errors[0].fieldName ).toBe( "Substrate" );
      expect( result.errors[0].reason ).toBe( MISSING_REQUIRED );
    } );

    it( "should report both fields in POF order when two required fields are unfilled", () => {
      const mockProject = {
        projectObservationFields: [
          {
            required: true,
            obsField: {
              allowedValues: [],
              id: 10,
              name: "Habitat",
            },
          },
          {
            required: true,
            obsField: {
              allowedValues: [],
              id: 20,
              name: "Substrate",
            },
          },
        ],
      };
      const mockObservation = { observationFieldValues: [] };
      const result = validateProjectFieldsForObservation( mockObservation, [mockProject] );
      expect( result.valid ).toBe( false );
      expect( result.errors.map( e => e.fieldName ) ).toEqual( ["Habitat", "Substrate"] );
    } );
  } );

  describe( "numeric fields", () => {
    test.each( [
      ["12.5"],
      ["42"],
      ["-3.2"],
      [" 7 "],
    ] )( "should be valid when a required numeric field's OFV value is %p", value => {
      const mockProject = {
        projectObservationFields: [{
          required: true,
          obsField: {
            allowedValues: [],
            datatype: "numeric",
            id: 10,
          },
        }],
      };
      const mockObservation = {
        observationFieldValues: [{ obsFieldId: 10, value }],
      };
      expect(
        validateProjectFieldsForObservation( mockObservation, [mockProject] ).valid,
      ).toBe( true );
    } );

    test.each( [
      ["abc"],
      // parseFloat would accept this, Number does not; must stay invalid
      // to match Android Legacy's Float.valueOf
      ["1.5abc"],
    ] )( "should return INVALID_NUMERIC when a numeric field's OFV value is %p", value => {
      const mockProject = {
        projectObservationFields: [{
          required: true,
          obsField: {
            allowedValues: [],
            datatype: "numeric",
            id: 10,
            name: "Count",
          },
        }],
      };
      const mockObservation = {
        observationFieldValues: [{ obsFieldId: 10, value }],
      };
      const result = validateProjectFieldsForObservation( mockObservation, [mockProject] );
      expect( result.valid ).toBe( false );
      expect( result.errors ).toHaveLength( 1 );
      expect( result.errors[0].fieldName ).toBe( "Count" );
      expect( result.errors[0].reason ).toBe( INVALID_NUMERIC );
    } );

    it( "should return INVALID_NUMERIC for an optional numeric field with text value", () => {
      const mockProject = {
        projectObservationFields: [{
          required: false,
          obsField: {
            allowedValues: [],
            datatype: "numeric",
            id: 10,
          },
        }],
      };
      const mockObservation = {
        observationFieldValues: [{ obsFieldId: 10, value: "abc" }],
      };
      const result = validateProjectFieldsForObservation( mockObservation, [mockProject] );
      expect( result.valid ).toBe( false );
      expect( result.errors[0].reason ).toBe( INVALID_NUMERIC );
    } );

    test.each( [
      [[]],
      [[{ obsFieldId: 10, value: "" }]],
    ] )( "should be valid for an optional numeric field with OFVs %p", observationFieldValues => {
      const mockProject = {
        projectObservationFields: [{
          required: false,
          obsField: {
            allowedValues: [],
            datatype: "numeric",
            id: 10,
          },
        }],
      };
      const mockObservation = { observationFieldValues };
      expect(
        validateProjectFieldsForObservation( mockObservation, [mockProject] ).valid,
      ).toBe( true );
    } );

    it( "should report a single MISSING_REQUIRED when a required numeric field is empty", () => {
      const mockProject = {
        projectObservationFields: [{
          required: true,
          obsField: {
            allowedValues: [],
            datatype: "numeric",
            id: 10,
          },
        }],
      };
      const mockObservation = { observationFieldValues: [] };
      const result = validateProjectFieldsForObservation( mockObservation, [mockProject] );
      expect( result.errors ).toHaveLength( 1 );
      expect( result.errors[0].reason ).toBe( MISSING_REQUIRED );
    } );
  } );

  describe( "multiple projects", () => {
    it( "should be valid when one OFV satisfies two projects requiring the same field", () => {
      const mockProjectA = {
        id: 1,
        title: "Project A",
        projectObservationFields: [{
          required: true,
          obsField: {
            allowedValues: [],
            id: 10,
            name: "Habitat",
          },
        }],
      };
      const mockProjectB = {
        id: 2,
        title: "Project B",
        projectObservationFields: [{
          required: true,
          obsField: {
            allowedValues: [],
            id: 10,
            name: "Habitat",
          },
        }],
      };
      const mockObservation = {
        observationFieldValues: [{ obsFieldId: 10, value: "shrubland" }],
      };
      const result = validateProjectFieldsForObservation(
        mockObservation,
        [mockProjectA, mockProjectB],
      );
      expect( result.valid ).toBe( true );
      expect( result.errors ).toEqual( [] );
    } );

    it( "should report one error per project when a shared required field is unfilled", () => {
      const mockProjectA = {
        id: 1,
        title: "Project A",
        projectObservationFields: [{
          required: true,
          obsField: {
            allowedValues: [],
            id: 10,
            name: "Habitat",
          },
        }],
      };
      const mockProjectB = {
        id: 2,
        title: "Project B",
        projectObservationFields: [{
          required: true,
          obsField: {
            allowedValues: [],
            id: 10,
            name: "Habitat",
          },
        }],
      };
      const mockObservation = { observationFieldValues: [] };
      const result = validateProjectFieldsForObservation(
        mockObservation,
        [mockProjectA, mockProjectB],
      );
      expect( result.valid ).toBe( false );
      expect( result.errors ).toHaveLength( 2 );
      expect( result.errors.map( e => e.projectTitle ) ).toEqual( ["Project A", "Project B"] );
      expect( result.errors.map( e => e.fieldName ) ).toEqual( ["Habitat", "Habitat"] );
    } );

    it( "should report only the failing project when the other is satisfied", () => {
      const mockProjectA = {
        id: 1,
        title: "Project A",
        projectObservationFields: [{
          required: true,
          obsField: {
            allowedValues: [],
            id: 10,
            name: "Habitat",
          },
        }],
      };
      const mockProjectB = {
        id: 2,
        title: "Project B",
        projectObservationFields: [{
          required: true,
          obsField: {
            allowedValues: [],
            id: 20,
            name: "Substrate",
          },
        }],
      };
      const mockObservation = {
        observationFieldValues: [{ obsFieldId: 10, value: "shrubland" }],
      };
      const result = validateProjectFieldsForObservation(
        mockObservation,
        [mockProjectA, mockProjectB],
      );
      expect( result.errors ).toHaveLength( 1 );
      expect( result.errors[0].projectTitle ).toBe( "Project B" );
      expect( result.errors[0].fieldName ).toBe( "Substrate" );
    } );

    it( "should report errors in the order the projects were passed in", () => {
      const mockProjectA = {
        id: 1,
        title: "Project A",
        projectObservationFields: [{
          required: true,
          obsField: {
            allowedValues: [],
            id: 10,
            name: "Habitat",
          },
        }],
      };
      const mockProjectB = {
        id: 2,
        title: "Project B",
        projectObservationFields: [{
          required: true,
          obsField: {
            allowedValues: [],
            id: 20,
            name: "Substrate",
          },
        }],
      };
      const mockObservation = { observationFieldValues: [] };
      const resultBA = validateProjectFieldsForObservation(
        mockObservation,
        [mockProjectB, mockProjectA],
      );
      expect( resultBA.errors.map( e => e.projectTitle ) ).toEqual( ["Project B", "Project A"] );
    } );
  } );

  describe( "edge cases", () => {
    it( "should be valid when no projects are passed", () => {
      const mockObservation = { observationFieldValues: [] };
      const result = validateProjectFieldsForObservation( mockObservation, [] );
      expect( result.valid ).toBe( true );
      expect( result.errors ).toEqual( [] );
    } );

    it( "should be valid when a project has no POFs", () => {
      const mockProject = { projectObservationFields: [] };
      const mockObservation = { observationFieldValues: [] };
      expect(
        validateProjectFieldsForObservation( mockObservation, [mockProject] ).valid,
      ).toBe( true );
    } );

    it( "should skip a POF without an obsField definition", () => {
      const mockProject = {
        projectObservationFields: [{
          required: true,
          obsField: undefined,
        }],
      };
      const mockObservation = { observationFieldValues: [] };
      expect(
        validateProjectFieldsForObservation( mockObservation, [mockProject] ).valid,
      ).toBe( true );
    } );
  } );
} );
