import Project from "realmModels/Project";
import factory from "tests/factory";

describe( "Project", ( ) => {
  describe( "mapApiToRealm", ( ) => {
    it( "maps summary fields and POFs", ( ) => {
      const mockRemoteProject = factory( "RemoteProject" );
      const mappedProject = Project.mapApiToRealm( mockRemoteProject );

      expect( mappedProject.description ).toBe( mockRemoteProject.description );
      expect( mappedProject.icon ).toBe( mockRemoteProject.icon );
      expect( mappedProject.id ).toBe( mockRemoteProject.id );
      expect( mappedProject.title ).toBe( mockRemoteProject.title );
      expect( mappedProject.projectObservationFields ).toHaveLength( 1 );
      expect( mappedProject.project_type ).toBe( mockRemoteProject.project_type );
    } );
  } );
} );
