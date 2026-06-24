import Observation from "realmModels/Observation";
import ObservationFieldValue from "realmModels/ObservationFieldValue";
import ProjectObservation from "realmModels/ProjectObservation";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import factory from "tests/factory";
import * as uuid from "uuid";

describe( "Observation", ( ) => {
  describe( "mapObservationForUpload", ( ) => {
    // observed_on is set by the server, clients specify the date with observed_on_string
    it( "should not include observed_on", ( ) => {
      expect(
        Observation.mapObservationForUpload( { observed_on: "2020-01-01" } ).observed_on,
      ).toBeUndefined( );
    } );
  } );

  describe( "mapApiToRealm", ( ) => {
    it(
      "should assign user.prefers_community_taxa from user.preferences.prefers_community_taxa",
      ( ) => {
        const mockApiObservation = {
          user: {
            preferences: {
              prefers_community_taxa: false,
            },
          },
        };
        expect(
          Observation.mapApiToRealm( mockApiObservation ).user.prefers_community_taxa,
        ).toEqual( mockApiObservation.user.preferences.prefers_community_taxa );
      },
    );
    it( "should set _created_at to a date object without Realm", ( ) => {
      expect( Observation.mapApiToRealm( { } )._created_at ).toBeInstanceOf( Date );
    } );
    it( "should create observationSounds from observation_sounds", ( ) => {
      const remoteObservationSound = factory( "RemoteObservationSound" );
      const mappedObservation = Observation.mapApiToRealm( {
        observation_sounds: [remoteObservationSound],
      } );
      expect( mappedObservation.observationSounds[0].sound.file_url )
        .toEqual( remoteObservationSound.sound.file_url );
      expect( mappedObservation.observationSounds[0].uuid )
        .toEqual( remoteObservationSound.uuid );
    } );

    it( "should map project_observations to projectObservations with created_at metadata", ( ) => {
      const mockRemoteObservation = factory( "RemoteObservation", {
        project_observations: [factory( "RemoteProjectObservation" )],
      } );
      const mappedObservation = Observation.mapApiToRealm( mockRemoteObservation );
      expect( mappedObservation.projectObservations ).toHaveLength( 1 );
      expect( mappedObservation.projectObservations[0]._created_at ).toBeInstanceOf( Date );
    } );

    it( "should map ofvs to observationFieldValues with created_at metadata", ( ) => {
      const mockRemoteObservation = factory( "RemoteObservation", {
        ofvs: [factory( "RemoteObservationFieldValue" )],
      } );
      const mappedObservation = Observation.mapApiToRealm( mockRemoteObservation );
      expect( mappedObservation.observationFieldValues ).toHaveLength( 1 );
      expect( mappedObservation.observationFieldValues[0]._created_at ).toBeInstanceOf( Date );
    } );
  } );

  describe( "upsertRemoteObservations", ( ) => {
    it( "should persist observationFieldValues in Realm", ( ) => {
      const mockRemoteObservation = factory( "RemoteObservation", {
        ofvs: [factory( "RemoteObservationFieldValue" )],
      } );

      Observation.upsertRemoteObservations( [mockRemoteObservation], global.realm );

      const obs = global.realm.objectForPrimaryKey( "Observation", mockRemoteObservation.uuid );
      expect( obs.observationFieldValues ).toHaveLength( 1 );
      expect( obs.observationFieldValues[0].value ).toBe(
        mockRemoteObservation.ofvs[0].value,
      );
      expect( obs.observationFieldValues[0].obsFieldId ).toBe(
        mockRemoteObservation.ofvs[0].field_id,
      );
    } );

    it( "should persist projectObservations in Realm", ( ) => {
      const mockRemoteObservation = factory( "RemoteObservation", {
        project_observations: [factory( "RemoteProjectObservation" )],
      } );

      Observation.upsertRemoteObservations( [mockRemoteObservation], global.realm );

      const obs = global.realm.objectForPrimaryKey( "Observation", mockRemoteObservation.uuid );
      expect( obs.projectObservations ).toHaveLength( 1 );
      expect( obs.projectObservations[0].id ).toBe(
        mockRemoteObservation.project_observations[0].id,
      );
      expect( obs.projectObservations[0].projectId ).toBe(
        mockRemoteObservation.project_observations[0].project_id,
      );
    } );
  } );

  describe( "needsSync", ( ) => {
    it.todo( "should need sync when a photo needs sync" );
    it.todo( "should need sync when a sound needs sync" );
    it( "should need sync when a project observation needs sync", ( ) => {
      const obsUuid = uuid.v4( );
      const syncDate = new Date( "2020-01-02" );
      safeRealmWrite( global.realm, ( ) => {
        global.realm.create( "Observation", {
          uuid: obsUuid,
          _synced_at: syncDate,
          _updated_at: syncDate,
          projectObservations: [ProjectObservation.new( 1 )],
        } );
      }, "create Observation with unsynced PO for needsSync test" );

      const obs = global.realm.objectForPrimaryKey( "Observation", obsUuid );
      expect( obs.needsSync( ) ).toBe( true );
    } );

    it( "should need sync when an observation field value needs sync", ( ) => {
      const obsUuid = uuid.v4( );
      const syncDate = new Date( "2020-01-02" );
      safeRealmWrite( global.realm, ( ) => {
        global.realm.create( "Observation", {
          uuid: obsUuid,
          _synced_at: syncDate,
          _updated_at: syncDate,
          observationFieldValues: [
            ObservationFieldValue.new( 5, "x" ),
          ],
        } );
      }, "create Observation with unsynced OFV for needsSync test" );

      const obs = global.realm.objectForPrimaryKey( "Observation", obsUuid );
      expect( obs.needsSync( ) ).toBe( true );
    } );
  } );

  describe( "filterUnsyncedObservations", ( ) => {
    it( "should include observations with unsynced project observations", ( ) => {
      const obsUuid = uuid.v4( );
      const syncDate = new Date( "2020-01-02" );
      safeRealmWrite( global.realm, ( ) => {
        global.realm.create( "Observation", {
          uuid: obsUuid,
          _synced_at: syncDate,
          _updated_at: syncDate,
          projectObservations: [ProjectObservation.new( 1 )],
        } );
      }, "create synced obs with unsynced PO" );

      const unsynced = Observation.filterUnsyncedObservations( global.realm );
      expect( unsynced.filtered( `uuid == "${obsUuid}"` ).length ).toBe( 1 );
    } );

    it( "should include observations with unsynced observation field values", ( ) => {
      const obsUuid = uuid.v4( );
      const syncDate = new Date( "2020-01-02" );
      safeRealmWrite( global.realm, ( ) => {
        global.realm.create( "Observation", {
          uuid: obsUuid,
          _synced_at: syncDate,
          _updated_at: syncDate,
          observationFieldValues: [
            ObservationFieldValue.new( 5, "x" ),
          ],
        } );
      }, "create synced obs with unsynced OFV" );

      const unsynced = Observation.filterUnsyncedObservations( global.realm );
      expect( unsynced.filtered( `uuid == "${obsUuid}"` ).length ).toBe( 1 );
    } );
  } );
} );
