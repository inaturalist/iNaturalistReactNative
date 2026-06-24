import ObservationFieldValue from "realmModels/ObservationFieldValue";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
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
} );
