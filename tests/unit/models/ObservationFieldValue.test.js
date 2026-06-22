import ObservationFieldValue from "realmModels/ObservationFieldValue";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import * as uuid from "uuid";

describe( "ObservationFieldValue", () => {
  describe( "findForProject", () => {
    it( "should find an OFV scoped by projectId and obsFieldId", () => {
      const obsUuid = uuid.v4();
      safeRealmWrite(
        global.realm,
        () => {
          global.realm.create( "Observation", {
            uuid: obsUuid,
            observationFieldValues: [
              ObservationFieldValue.new( 1, 10, "a" ),
              ObservationFieldValue.new( 2, 10, "b" ),
            ],
          } );
        },
        "create Observation with scoped OFVs",
      );

      const obs = global.realm.objectForPrimaryKey( "Observation", obsUuid );
      expect( ObservationFieldValue.findForProject( obs, 2, 10 )?.value ).toBe( "b" );
      expect( ObservationFieldValue.findForProject( obs, 1, 10 )?.value ).toBe( "a" );
      expect( ObservationFieldValue.findForProject( obs, 3, 10 ) ).toBeUndefined();
    } );
  } );
} );
