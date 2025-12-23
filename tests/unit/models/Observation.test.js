import Observation from "realmModels/Observation";
import factory from "tests/factory";

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
  } );

  // It would be nice to test an Observation instance
  describe( "needsSync", ( ) => {
    it.todo( "should need sync when a photo needs sync" );
    // it( "should need sync when a photo needs sync", ( ) => {
    //   const syncDate = faker.date.past( );
    //   const observation = new Observation( {
    //     _synced_at: syncDate,
    //     _updated_at: syncDate
    //   } );
    //   expect( observation.needsSync( ) ).toEqual( false );
    //   const mockObservationPhoto = factory.states( "uploaded" )( "LocalObservationPhoto" );
    //   observation.observationPhotos = [mockObservationPhoto];
    //   expect( observation.needsSync( ) ).toEqual( false );
    //   mockObservationPhoto.needsSync.mockImplementation( ( ) => true );
    //   expect( observation.needsSync( ) ).toEqual( true );
    // } );
    it.todo( "should need sync when a sound needs sync" );
  } );
} );
