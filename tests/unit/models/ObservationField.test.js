import ObservationField from "realmModels/ObservationField";
import factory from "tests/factory";

const mockRemoteOf = factory( "RemoteObservationField", {
  allowed_values: "yes|no",
} );

describe( "ObservationField", ( ) => {
  describe( "mapApiToRealm", ( ) => {
    it( "maps fields, splitting allowed_values", ( ) => {
      const mappedOf = ObservationField.mapApiToRealm( mockRemoteOf );

      expect( mappedOf.id ).toBe( mockRemoteOf.id );
      expect( mappedOf.datatype ).toBe( mockRemoteOf.datatype );
      expect( mappedOf.description ).toBe( mockRemoteOf.description );
      expect( mappedOf.name ).toBe( mockRemoteOf.name );
      expect( mappedOf.allowedValues ).toEqual( ["yes", "no"] );
    } );
  } );
} );
