import * as apiObservations from "api/observations";
import * as authService from "components/LoginSignUp/AuthenticationService";
import factory from "tests/factory";
import * as uploaders from "uploaders";
import * as mediaUploader from "uploaders/mediaUploader";
import uploadObservation from "uploaders/observationUploader";
import * as progressTracker from "uploaders/utils/progressTracker";

jest.mock( "components/LoginSignUp/AuthenticationService" );
jest.mock( "uploaders/utils/progressTracker" );
jest.mock( "uploaders/mediaUploader" );
jest.mock( "uploaders" );
jest.mock( "api/observations" );
jest.mock( "sharedHelpers/safeRealmWrite", () => jest.fn() );
jest.mock( "realmModels/Observation", () => {
  const actual = jest.requireActual( "realmModels/Observation" );
  actual.default.upsertRemoteObservations = jest.fn();
  return actual;
} );

describe( "uploadObservation", () => {
  let mockObservation;
  let mockRealm;
  let mockProgressTracker;
  let mockMediaItems;

  beforeEach( () => {
    jest.clearAllMocks();

    mockObservation = factory( "LocalObservation", {
      uuid: "test-uuid-123"
    } );
    mockObservation.wasSynced = jest.fn( () => false );

    mockRealm = {
      objectForPrimaryKey: jest.fn( () => factory( "LocalObservation" ) )
    };

    mockProgressTracker = {
      start: jest.fn(),
      complete: jest.fn(),
      error: jest.fn()
    };

    mockMediaItems = {
      unsyncedObservationPhotos: [],
      modifiedObservationPhotos: [],
      unsyncedObservationSounds: []
    };

    authService.getJWT.mockResolvedValue( "test-json-web-token" );
    progressTracker.trackObservationUpload.mockReturnValue( mockProgressTracker );

    // Mock the new functions in mediaUploader
    mediaUploader.uploadObservationMedia.mockResolvedValue( mockMediaItems );
    mediaUploader.attachMediaToObservation.mockResolvedValue( undefined );

    uploaders.prepareObservationForUpload.mockReturnValue( {
      uuid: mockObservation.uuid,
      taxon_id: 12345
    } );

    apiObservations.createObservation.mockResolvedValue( {
      results: [{ uuid: mockObservation.uuid }]
    } );

    apiObservations.updateObservation.mockResolvedValue( {
      results: [{ uuid: mockObservation.uuid }]
    } );
  } );

  it( "should start and complete progress tracking", async () => {
    await uploadObservation( mockObservation, mockRealm );

    expect( progressTracker.trackObservationUpload ).toHaveBeenCalledWith( mockObservation.uuid );
    expect( mockProgressTracker.start ).toHaveBeenCalled();
    expect( mockProgressTracker.complete ).toHaveBeenCalled();
  } );

  it( "should validate the API token", async () => {
    await uploadObservation( mockObservation, mockRealm );
    expect( authService.getJWT ).toHaveBeenCalled();
  } );

  it( "should throw an error if no API token is available", async () => {
    authService.getJWT.mockResolvedValue( null );

    await expect( uploadObservation( mockObservation, mockRealm ) )
      .rejects.toThrow( "Gack, tried to upload an observation without API token!" );
  } );

  it( "should prepare the observation for upload", async () => {
    await uploadObservation( mockObservation, mockRealm );
    expect( uploaders.prepareObservationForUpload ).toHaveBeenCalledWith( mockObservation );
  } );

  it( "should create a new observation if it was not previously synced", async () => {
    mockObservation.wasSynced.mockReturnValue( false );

    await uploadObservation( mockObservation, mockRealm );

    expect( apiObservations.createObservation ).toHaveBeenCalledWith(
      expect.objectContaining( {
        observation: expect.anything(),
        fields: { id: true }
      } ),
      expect.objectContaining( { api_token: "test-json-web-token" } )
    );
    expect( apiObservations.updateObservation ).not.toHaveBeenCalled();
  } );

  it( "should update an existing observation if it was previously synced", async () => {
    mockObservation.wasSynced.mockReturnValue( true );

    await uploadObservation( mockObservation, mockRealm );

    expect( apiObservations.updateObservation ).toHaveBeenCalledWith(
      expect.objectContaining( {
        observation: expect.anything(),
        fields: { id: true },
        id: mockObservation.uuid,
        ignore_photos: true
      } ),
      expect.objectContaining( { api_token: "test-json-web-token" } )
    );
    expect( apiObservations.createObservation ).not.toHaveBeenCalled();
  } );

  it( "should call uploadObservationMedia with correct parameters", async () => {
    await uploadObservation( mockObservation, mockRealm );

    expect( mediaUploader.uploadObservationMedia ).toHaveBeenCalledWith(
      mockObservation,
      expect.objectContaining( { api_token: "test-json-web-token" } ),
      mockRealm
    );
  } );

  it(
    "should call attachMediaToObservation with correct parameters after observation creation",
    async () => {
      await uploadObservation( mockObservation, mockRealm );

      expect( mediaUploader.attachMediaToObservation ).toHaveBeenCalledWith(
        mockObservation.uuid,
        mockMediaItems,
        expect.objectContaining( { api_token: "test-json-web-token" } ),
        mockRealm
      );
    }
  );

  it( "should mark the record as uploaded after media is attached", async () => {
    await uploadObservation( mockObservation, mockRealm );

    expect( uploaders.markRecordUploaded ).toHaveBeenCalledWith(
      mockObservation.uuid,
      null,
      "Observation",
      expect.anything(),
      mockRealm
    );
  } );

  it( "should return the API response", async () => {
    const mockResponse = { results: [{ uuid: mockObservation.uuid }] };
    apiObservations.createObservation.mockResolvedValue( mockResponse );

    const result = await uploadObservation( mockObservation, mockRealm );

    expect( result ).toEqual( mockResponse );
  } );

  it( "should throw an error if observation creation fails", async () => {
    apiObservations.createObservation.mockRejectedValue( new Error( "API Error" ) );

    await expect( uploadObservation( mockObservation, mockRealm ) )
      .rejects.toThrow( "API Error" );
  } );

  it( "should throw an error if media upload fails", async () => {
    mediaUploader.uploadObservationMedia.mockRejectedValue( new Error( "Media Upload Error" ) );

    await expect( uploadObservation( mockObservation, mockRealm ) )
      .rejects.toThrow( "Media Upload Error" );
  } );

  it( "should throw an error if media attachment fails", async () => {
    mediaUploader.attachMediaToObservation
      .mockRejectedValue( new Error( "Media Attachment Error" ) );

    await expect( uploadObservation( mockObservation, mockRealm ) )
      .rejects.toThrow( "Media Attachment Error" );
  } );

  it( "should not complete progress tracking when errors occur", async () => {
    apiObservations.createObservation.mockRejectedValue( new Error( "API Error" ) );

    await expect( uploadObservation( mockObservation, mockRealm ) ).rejects.toThrow( "API Error" );
    expect( mockProgressTracker.complete ).not.toHaveBeenCalled();
  } );

  it( "should throw an error when observation creation returns null response", async () => {
    apiObservations.createObservation.mockResolvedValue( null );

    await expect( uploadObservation( mockObservation, mockRealm ) )
      .rejects.toThrow( "No response from observation upload" );

    // Should not attempt to attach media or mark as uploaded
    expect( mediaUploader.attachMediaToObservation ).not.toHaveBeenCalled();
    expect( uploaders.markRecordUploaded ).not.toHaveBeenCalled();
  } );

  it( "should pass custom options to API calls", async () => {
    const customOpts = { locale: "es-ES" };

    await uploadObservation( mockObservation, mockRealm, customOpts );

    expect( apiObservations.createObservation ).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining( {
        api_token: "test-json-web-token",
        locale: "es-ES"
      } )
    );
  } );
} );
