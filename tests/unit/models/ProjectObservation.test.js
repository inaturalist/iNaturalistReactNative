import ProjectObservation from "realmModels/ProjectObservation";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import factory from "tests/factory";
import * as uuid from "uuid";

describe( "ProjectObservation", ( ) => {
  describe( "new", ( ) => {
    it( "should construct a PO", ( ) => {
      const po = ProjectObservation.new( 42 );
      expect( po.uuid ).toBe( po.uuid.toLowerCase( ) );
      expect( po.projectId ).toBe( 42 );
      expect( po._created_at ).toBeInstanceOf( Date );
      expect( po._updated_at ).toBeInstanceOf( Date );
    } );
  } );

  describe( "needsSync and wasSynced", ( ) => {
    it( "should need sync when _synced_at is null", ( ) => {
      const obsUuid = uuid.v4( );
      safeRealmWrite( global.realm, ( ) => {
        global.realm.create( "Observation", {
          uuid: obsUuid,
          _synced_at: new Date( ),
          _updated_at: new Date( ),
          projectObservations: [ProjectObservation.new( 1 )],
        } );
      }, "create Observation with unsynced PO" );

      const obs = global.realm.objectForPrimaryKey( "Observation", obsUuid );
      const po = obs.projectObservations[0];
      expect( po.needsSync( ) ).toBe( true );
      expect( po.wasSynced( ) ).toBe( false );
    } );

    it( "should need sync when _updated_at is newer than _synced_at", ( ) => {
      const obsUuid = uuid.v4( );
      const syncedAt = new Date( "2020-01-01" );
      const updatedAt = new Date( "2020-01-02" );
      safeRealmWrite( global.realm, ( ) => {
        global.realm.create( "Observation", {
          uuid: obsUuid,
          _synced_at: syncedAt,
          _updated_at: syncedAt,
          projectObservations: [{
            ...ProjectObservation.new( 1 ),
            _synced_at: syncedAt,
            _updated_at: updatedAt,
          }],
        } );
      }, "create Observation with edited PO" );

      const obs = global.realm.objectForPrimaryKey( "Observation", obsUuid );
      expect( obs.projectObservations[0].needsSync( ) ).toBe( true );
      expect( obs.projectObservations[0].wasSynced( ) ).toBe( true );
    } );

    it( "should not need sync when synced after last update", ( ) => {
      const obsUuid = uuid.v4( );
      const updatedAt = new Date( "2020-01-01" );
      const syncedAt = new Date( "2020-01-02" );
      safeRealmWrite( global.realm, ( ) => {
        global.realm.create( "Observation", {
          uuid: obsUuid,
          _synced_at: syncedAt,
          _updated_at: updatedAt,
          projectObservations: [{
            ...ProjectObservation.new( 1 ),
            _synced_at: syncedAt,
            _updated_at: updatedAt,
          }],
        } );
      }, "create Observation with synced PO" );

      const obs = global.realm.objectForPrimaryKey( "Observation", obsUuid );
      expect( obs.projectObservations[0].needsSync( ) ).toBe( false );
      expect( obs.projectObservations[0].wasSynced( ) ).toBe( true );
    } );
  } );

  describe( "mapApiToRealm", ( ) => {
    it( "should map API PO with synced metadata", ( ) => {
      const mockRemotePo = factory( "RemoteProjectObservation" );

      const mapped = ProjectObservation.mapApiToRealm( mockRemotePo );
      expect( mapped.id ).toBe( mockRemotePo.id );
      expect( mapped.projectId ).toBe( mockRemotePo.project_id );
      expect( mapped.uuid ).toBe( mockRemotePo.uuid );
      expect( mapped._synced_at ).toBeInstanceOf( Date );
    } );
  } );
} );
