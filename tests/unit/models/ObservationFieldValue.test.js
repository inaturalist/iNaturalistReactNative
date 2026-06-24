import ObservationFieldValue from "realmModels/ObservationFieldValue";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import factory from "tests/factory";
import * as uuid from "uuid";

describe( "ObservationFieldValue", () => {
  describe( "new", () => {
    it( "should construct an OFV", () => {
      const ofv = ObservationFieldValue.new( 99, "male" );
      expect( ofv.uuid ).toBe( ofv.uuid.toLowerCase() );
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
