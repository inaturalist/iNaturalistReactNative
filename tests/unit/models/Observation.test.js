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
} );
