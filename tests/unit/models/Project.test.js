import Project from "realmModels/Project";
import factory from "tests/factory";

describe( "Project", ( ) => {
  describe( "mapRealmToPojo", ( ) => {
    it( "sorts project observation fields by position", ( ) => {
      const mockProject = factory( "LocalProject" );
      mockProject.projectObservationFields = [
        factory( "LocalProjectObservationField", { position: 2 } ),
        factory( "LocalProjectObservationField", { position: 0 } ),
        factory( "LocalProjectObservationField", { position: 1 } ),
      ];

      const mappedProject = Project.mapRealmToPojo( mockProject );

      expect( mappedProject.projectObservationFields.map( pof => pof.position ) )
        .toEqual( [0, 1, 2] );
    } );
  } );

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

  describe( "upsertRemoteProjects", ( ) => {
    it( "upserts projects and embedded POF and OF", ( ) => {
      const mockRemoteProject = factory( "RemoteProject" );
      Project.upsertRemoteProjects( [mockRemoteProject], global.realm );

      const upsertedProject = global.realm.objectForPrimaryKey( "Project", mockRemoteProject.id );
      expect( upsertedProject.title ).toBe( mockRemoteProject.title );
      const { projectObservationFields } = upsertedProject;
      const pof1 = projectObservationFields[0];
      expect( pof1.id ).toBe(
        mockRemoteProject.project_observation_fields[0].id,
      );
      expect( pof1.obsField.id ).toBe(
        mockRemoteProject.project_observation_fields[0].observation_field.id,
      );
    } );
  } );
} );
