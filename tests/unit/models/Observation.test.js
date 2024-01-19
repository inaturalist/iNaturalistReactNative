import Observation from "realmModels/Observation";

describe( "Observation", ( ) => {
  describe( "mapObservationForUpload", ( ) => {
    // observed_on is set by the server, clients specify the date with observed_on_string
    it( "should not include observed_on", ( ) => {
      expect(
        Observation.mapObservationForUpload( { observed_on: "2020-01-01" } ).observed_on
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
              prefers_community_taxa: false
            }
          }
        };
        expect(
          Observation.mapApiToRealm( mockApiObservation ).user.prefers_community_taxa
        ).toEqual( mockApiObservation.user.preferences.prefers_community_taxa );
      }
    );
  } );
  it( "should set _created_at to a date object without Realm", ( ) => {
    expect( Observation.mapApiToRealm( { } )._created_at ).toBeInstanceOf( Date );
  } );
} );
