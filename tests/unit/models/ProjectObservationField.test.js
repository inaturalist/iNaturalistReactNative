import ProjectObservationField from "realmModels/ProjectObservationField";
import factory from "tests/factory";

describe( "ProjectObservationField", ( ) => {
  describe( "mapApiToRealm", ( ) => {
    it( "maps fields, splitting allowed_values", ( ) => {
      const mockRemotePof = factory( "RemoteProjectObservationField" );
      const mappedPof = ProjectObservationField.mapApiToRealm( mockRemotePof );

      expect( mappedPof.id ).toBe( mockRemotePof.id );
      expect( mappedPof.obsField.id ).toBe(
        mockRemotePof.observation_field.id,
      );
      expect( mappedPof.position ).toBe( mockRemotePof.position );
      expect( mappedPof.required ).toBe( mockRemotePof.required );
    } );
  } );
} );
