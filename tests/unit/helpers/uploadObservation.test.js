import inatjs from "inaturalistjs";
import uploadObservation from "sharedHelpers/uploadObservation";
import factory, { makeResponse } from "tests/factory";

// Mock JWT so uploadObservation will act like it's authenticated
jest.mock( "components/LoginSignUp/AuthenticationService", ( ) => ( {
  getJWT: jest.fn( ( ) => "test-json-web-token" )
} ) );

// Mock safeRealmWrite b/c this function writes to realm
jest.mock( "sharedHelpers/safeRealmWrite", ( ) => jest.fn( ) );

// This function also tries to retrieve records from Realm. If your test needs
// this to fetch a specific record, you'll need to change the mock
// implementation here
const realm = {
  objectForPrimaryKey: jest.fn( ( _modelName, _primaryKey ) => factory( "LocalObservation" ) )
};

function makeObservationWithPhotos( ) {
  const mockObservationPhoto = factory( "LocalObservationPhoto" );
  // I haven't figured out a way to fake toJSON in a factoria object. This
  // makes sure that toJSON returns something object like with all the same
  // values. ~~~kueda 20240221
  mockObservationPhoto.toJSON.mockImplementation( ( ) => mockObservationPhoto );
  const mockObservation = factory( "LocalObservation", {
    observationPhotos: [mockObservationPhoto]
  } );
  return mockObservation;
}

function makeObservationWithSounds( ) {
  const mockObservationSound = factory( "LocalObservationSound" );
  mockObservationSound.toJSON.mockImplementation( ( ) => mockObservationSound );
  const mockObservation = factory( "LocalObservation", {
    observationSounds: [mockObservationSound]
  } );
  return mockObservation;
}

describe( "uploadObservation", ( ) => {
  beforeEach( ( ) => {
    inatjs.observations.create.mockReset( );
    inatjs.observation_photos.create.mockReset( );
    inatjs.observation_sounds.create.mockReset( );
    inatjs.photos.create.mockReset( );
    inatjs.sounds.create.mockReset( );
  } );
  it( "should call inatjs.observations.create", async ( ) => {
    const mockObservation = factory( "LocalObservation" );
    await uploadObservation( mockObservation );
    expect( inatjs.observations.create ).toHaveBeenCalledTimes( 1 );
  } );

  it( "should call inatjs.photos.create for an obs w/ photos", async ( ) => {
    await uploadObservation( makeObservationWithPhotos( ) );
    expect( inatjs.photos.create ).toHaveBeenCalledTimes( 1 );
  } );

  it( "should call inatjs.observation_photos.create for an obs w/ photos", async ( ) => {
    inatjs.observations.create.mockResolvedValue(
      makeResponse( [factory( "RemoteObservation" )] )
    );
    await uploadObservation( makeObservationWithPhotos( ), realm );
    expect( inatjs.observation_photos.create ).toHaveBeenCalledTimes( 1 );
  } );

  it( "should not call inatjs.photos.create for an obs w/o photos", async ( ) => {
    await uploadObservation( factory( "LocalObservation" ) );
    expect( inatjs.photos.create ).not.toHaveBeenCalled( );
  } );

  it( "should call inatjs.sounds.create for an obs w/ sounds", async ( ) => {
    await uploadObservation( makeObservationWithSounds( ) );
    expect( inatjs.sounds.create ).toHaveBeenCalledTimes( 1 );
  } );

  it( "should call inatjs.observation_sounds.create for an obs w/ sounds", async ( ) => {
    inatjs.observations.create.mockResolvedValue(
      makeResponse( [factory( "RemoteObservation" )] )
    );
    await uploadObservation( makeObservationWithSounds( ), realm );
    expect( inatjs.observation_sounds.create ).toHaveBeenCalledTimes( 1 );
  } );

  it( "should not call inatjs.sounds.create for an obs w/o sounds", async ( ) => {
    await uploadObservation( factory( "LocalObservation" ) );
    expect( inatjs.sounds.create ).not.toHaveBeenCalled( );
  } );

  describe( "for an observation with updated photos", ( ) => {
    it( "should call inatjs.observation_photos.update", async ( ) => {
      const mockObservationPhoto = factory.states( "uploaded" )( "LocalObservationPhoto" );
      mockObservationPhoto.needsSync.mockImplementation( ( ) => true );
      mockObservationPhoto.toJSON.mockImplementation( ( ) => mockObservationPhoto );
      const mockObservation = factory.states( "uploaded" )( "LocalObservation", {
        observationPhotos: [mockObservationPhoto]
      } );
      inatjs.observations.update.mockResolvedValue(
        makeResponse( [factory( "RemoteObservation" )] )
      );
      await uploadObservation( mockObservation, realm );
      expect( inatjs.observation_photos.update ).toHaveBeenCalledTimes( 1 );
    } );
  } );
} );
