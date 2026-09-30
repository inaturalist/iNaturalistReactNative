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

    it( "maps rules and rule preferences", ( ) => {
      const mockRemoteProject = factory( "RemoteProject", {
        project_observation_rules: [factory( "RemoteProjectObservationRule" )],
        rule_preferences: [{ field: "quality_grade", value: "research,needs_id" }],
      } );
      const mappedProject = Project.mapApiToRealm( mockRemoteProject );

      expect( mappedProject.project_observation_rules ).toHaveLength( 1 );
      expect( mappedProject.rule_preferences ).toEqual( [
        { field: "quality_grade", value: "research,needs_id" },
      ] );
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

    it( "persists rules and rule preferences that survive mapRealmToPojo", ( ) => {
      const mockRule = factory( "RemoteProjectObservationRule" );
      const mockRemoteProject = factory( "RemoteProject", {
        project_observation_rules: [mockRule],
        rule_preferences: [
          { field: "d1", value: "2026-09-10" },
          { field: "members_only", value: null },
        ],
      } );
      Project.upsertRemoteProjects( [mockRemoteProject], global.realm );

      const upsertedProject = global.realm.objectForPrimaryKey( "Project", mockRemoteProject.id );
      const pojo = Project.mapRealmToPojo( upsertedProject );
      expect( pojo.project_observation_rules ).toEqual( [mockRule] );
      expect( pojo.rule_preferences ).toEqual( mockRemoteProject.rule_preferences );
    } );

    it( "replaces cached rules on re-sync", ( ) => {
      const mockRemoteProject = factory( "RemoteProject", {
        project_observation_rules: [
          factory( "RemoteProjectObservationRule" ),
          factory( "RemoteProjectObservationRule" ),
        ],
      } );
      Project.upsertRemoteProjects( [mockRemoteProject], global.realm );
      const newRule = factory( "RemoteProjectObservationRule" );
      Project.upsertRemoteProjects( [{
        ...mockRemoteProject,
        project_observation_rules: [newRule],
      }], global.realm );

      const upsertedProject = global.realm.objectForPrimaryKey( "Project", mockRemoteProject.id );
      expect( upsertedProject.project_observation_rules.map( r => r.id ) ).toEqual( [newRule.id] );
    } );
  } );
} );
