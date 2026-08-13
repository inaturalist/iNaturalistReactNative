import ObservationFieldValue from "realmModels/ObservationFieldValue";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import factory from "tests/factory";
import * as uuid from "uuid";

describe( "ObservationFieldValue", () => {
  describe( "new", () => {
    it( "should construct an OFV", () => {
      const ofv = ObservationFieldValue.new( 99, "male" );
      expect( ofv.uuid ).toBe( ofv.uuid );
      expect( ofv.obsFieldId ).toBe( 99 );
      expect( ofv.value ).toBe( "male" );
      expect( ofv._created_at ).toBeInstanceOf( Date );
      expect( ofv._updated_at ).toBeInstanceOf( Date );
    } );
  } );

  describe( "findForObsField", () => {
    it( "should find an OFV by obsFieldId", () => {
      const obsUuid = uuid.v4();
      safeRealmWrite(
        global.realm,
        () => {
          global.realm.create( "Observation", {
            uuid: obsUuid,
            observationFieldValues: [
              ObservationFieldValue.new( 10, "a" ),
              ObservationFieldValue.new( 20, "b" ),
            ],
          } );
        },
        "create Observation with OFVs",
      );

      const obs = global.realm.objectForPrimaryKey( "Observation", obsUuid );
      expect( ObservationFieldValue.findForObsField( obs, 20 )?.value ).toBe( "b" );
      expect( ObservationFieldValue.findForObsField( obs, 10 )?.value ).toBe( "a" );
      expect( ObservationFieldValue.findForObsField( obs, 99 ) ).toBeUndefined();
    } );

    it( "should find an OFV pending removal or deletion", () => {
      const obs = {
        observationFieldValues: [
          { obsFieldId: 10, value: "a", _pendingRemoval: true },
          { obsFieldId: 20, value: "b", _pending_deletion: true },
        ],
      };
      expect( ObservationFieldValue.findForObsField( obs, 10 )?.value ).toBe( "a" );
      expect( ObservationFieldValue.findForObsField( obs, 20 )?.value ).toBe( "b" );
    } );
  } );

  describe( "isActive", () => {
    it( "should return false when pending removal or deletion", () => {
      expect( ObservationFieldValue.isActive( { obsFieldId: 1, _pendingRemoval: true } ) )
        .toBe( false );
      expect( ObservationFieldValue.isActive( { obsFieldId: 1, _pending_deletion: true } ) )
        .toBe( false );
    } );

    it( "should return true for a normal OFV", () => {
      expect( ObservationFieldValue.isActive( { obsFieldId: 1, value: "x" } ) ).toBe( true );
    } );
  } );

  describe( "findActiveForObsField", () => {
    it( "should find an active OFV by obsFieldId", () => {
      const obs = {
        observationFieldValues: [
          { obsFieldId: 10, value: "a" },
          { obsFieldId: 20, value: "b", _pendingRemoval: true },
          { obsFieldId: 30, value: "c", _pending_deletion: true },
        ],
      };
      expect( ObservationFieldValue.findActiveForObsField( obs, 10 )?.value ).toBe( "a" );
      expect( ObservationFieldValue.findActiveForObsField( obs, 20 ) ).toBeUndefined();
      expect( ObservationFieldValue.findActiveForObsField( obs, 30 ) ).toBeUndefined();
      expect( ObservationFieldValue.findActiveForObsField( obs, 99 ) ).toBeUndefined();
    } );
  } );

  describe( "mapApiToRealm", () => {
    it( "should map API OFV with sync metadata", () => {
      const mockRemoteOfv = factory( "RemoteObservationFieldValue" );

      const mapped = ObservationFieldValue.mapApiToRealm( mockRemoteOfv );
      expect( mapped.id ).toBe( mockRemoteOfv.id );
      expect( mapped.obsFieldId ).toBe( mockRemoteOfv.field_id );
      expect( mapped.value ).toBe( mockRemoteOfv.value );
      expect( mapped.uuid ).toBe( mockRemoteOfv.uuid );
      expect( mapped._synced_at ).toBeInstanceOf( Date );
    } );
  } );
} );
