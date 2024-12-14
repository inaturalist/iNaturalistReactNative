import inatjs from "inaturalistjs";
import uploadObservation from "sharedHelpers/uploadObservation";
import factory, { makeResponse } from "tests/factory";

// Mock JWT so uploadObservation will act like it's authenticated
jest.mock( "components/LoginSignUp/AuthenticationService", ( ) => ( {
  getJWT: jest.fn( ( ) => "test-json-web-token" )
} ) );

// Mock safeRealmWrite b/c this function writes to realm
jest.mock( "sharedHelpers/safeRealmWrite", ( ) => jest.fn( ) );

// Mock fetches, since this helper will try to fetch the most up-to-date copy
// of the obs after POSTing
inatjs.observations.fetch.mockImplementation(
  uuid => makeResponse( [factory( "RemoteObservation", { uuid } )] )
);

// Mock upsert, but only upsert. It should happen but we don't care if it
// works in a unit test
jest.mock( "realmModels/Observation", () => {
  const actual = jest.requireActual( "realmModels/Observation" );
  actual.default.upsertRemoteObservations = jest.fn( );
  return actual;
} );

// This function also tries to retrieve records from Realm. If your test needs
// this to fetch a specific record, you'll need to change the mock
// implementation here
const realm = {
  objectForPrimaryKey: jest.fn( ( _modelName, _primaryKey ) => factory( "LocalObservation" ) )
};

function makeObservationWithPhotos( ) {
  const mockObservationPhoto = factory( "LocalObservationPhoto" );
  const mockObservation = factory( "LocalObservation", {
    observationPhotos: [mockObservationPhoto]
  } );
  return mockObservation;
}

function makeObservationWithSounds( ) {
  const mockObservationSound = factory( "LocalObservationSound" );
  const mockObservation = factory( "LocalObservation", {
    observationSounds: [mockObservationSound]
  } );
  return mockObservation;
}

const uploadObservationWithOptions = async observation => {
  await uploadObservation( observation, realm, {
    updateTotalUploadProgress: jest.fn( )
  } );
};

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
    await uploadObservationWithOptions( mockObservation );
    expect( inatjs.observations.create ).toHaveBeenCalledTimes( 1 );
  } );

  it( "should call inatjs.photos.create for an obs w/ photos", async ( ) => {
    await uploadObservationWithOptions( makeObservationWithPhotos( ) );
    expect( inatjs.photos.create ).toHaveBeenCalledTimes( 1 );
  } );

  it( "should call inatjs.observation_photos.create for an obs w/ photos", async ( ) => {
    inatjs.observations.create.mockResolvedValue(
      makeResponse( [factory( "RemoteObservation" )] )
    );
    await uploadObservationWithOptions( makeObservationWithPhotos( ) );
    expect( inatjs.observation_photos.create ).toHaveBeenCalledTimes( 1 );
  } );

  it( "should not call inatjs.photos.create for an obs w/o photos", async ( ) => {
    await uploadObservationWithOptions( factory( "LocalObservation" ) );
    expect( inatjs.photos.create ).not.toHaveBeenCalled( );
  } );

  it( "should call inatjs.sounds.create for an obs w/ sounds", async ( ) => {
    await uploadObservationWithOptions( makeObservationWithSounds( ) );
    expect( inatjs.sounds.create ).toHaveBeenCalledTimes( 1 );
  } );

  it( "should call inatjs.observation_sounds.create for an obs w/ sounds", async ( ) => {
    inatjs.observations.create.mockResolvedValue(
      makeResponse( [factory( "RemoteObservation" )] )
    );
    await uploadObservationWithOptions( makeObservationWithSounds( ) );
    expect( inatjs.observation_sounds.create ).toHaveBeenCalledTimes( 1 );
  } );

  it( "should not call inatjs.sounds.create for an obs w/o sounds", async ( ) => {
    await uploadObservationWithOptions( factory( "LocalObservation" ) );
    expect( inatjs.sounds.create ).not.toHaveBeenCalled( );
  } );

  describe( "for an observation with updated photos", ( ) => {
    it( "should call inatjs.observation_photos.update", async ( ) => {
      const mockObservationPhoto = factory.states( "uploaded" )( "LocalObservationPhoto" );
      mockObservationPhoto.needsSync.mockImplementation( ( ) => true );
      const mockObservation = factory.states( "uploaded" )( "LocalObservation", {
        observationPhotos: [mockObservationPhoto]
      } );
      const mockRemoteObservation = factory( "RemoteObservation" );
      inatjs.observations.update.mockResolvedValue(
        makeResponse( [mockRemoteObservation] )
      );
      inatjs.observations.fetch.mockResolvedValue(
        makeResponse( [mockRemoteObservation] )
      );
      await uploadObservationWithOptions( mockObservation );
      expect( inatjs.observation_photos.update ).toHaveBeenCalledTimes( 1 );
    } );
  } );
} );
