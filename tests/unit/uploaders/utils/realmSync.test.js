import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { markRecordUploaded } from "uploaders";

jest.mock( "sharedHelpers/safeRealmWrite" );

describe( "markRecordUploaded", () => {
  let mockRealm;
  let mockObservation;
  let mockObsPhoto;
  let mockObsSound;
  let mockPhoto;
  let mockResponse;

  beforeEach( () => {
    jest.clearAllMocks();

    mockObsPhoto = { uuid: "photo123", id: null, _synced_at: null };
    mockObsSound = { uuid: "sound123", id: null, _synced_at: null };
    mockPhoto = { id: null, _synced_at: null };

    mockObservation = {
      uuid: "obs123",
      id: null,
      _synced_at: null,
      needs_sync: true,
      observationPhotos: [mockObsPhoto],
      observationSounds: [mockObsSound],
    };

    mockResponse = {
      results: [{ id: 12345 }],
    };

    mockRealm = {
      isClosed: false,
      objectForPrimaryKey: jest.fn().mockReturnValue( mockObservation ),
    };

    // Mock the safeRealmWrite implementation
    safeRealmWrite.mockImplementation( ( realm, callback ) => {
      callback();
    } );
  } );

  test( "should do nothing if realm is closed", () => {
    mockRealm.isClosed = true;

    markRecordUploaded( mockObservation.uuid, null, "Observation", mockResponse, mockRealm );

    expect( safeRealmWrite ).not.toHaveBeenCalled();
  } );

  test( "should update an Observation record correctly", () => {
    markRecordUploaded( "obs123", null, "Observation", mockResponse, mockRealm );

    expect( mockRealm.objectForPrimaryKey ).toHaveBeenCalledWith( "Observation", "obs123" );
    expect( safeRealmWrite ).toHaveBeenCalledTimes( 1 );

    expect( mockObservation.id ).toBe( 12345 );
    expect( mockObservation._synced_at ).toBeInstanceOf( Date );
    expect( mockObservation.needs_sync ).toBe( false );
  } );

  test( "should update an ObservationPhoto record correctly", () => {
    markRecordUploaded( "obs123", "photo123", "ObservationPhoto", mockResponse, mockRealm );

    expect( mockRealm.objectForPrimaryKey ).toHaveBeenCalledWith( "Observation", "obs123" );
    expect( safeRealmWrite ).toHaveBeenCalledTimes( 1 );

    expect( mockObsPhoto.id ).toBe( 12345 );
    expect( mockObsPhoto._synced_at ).toBeInstanceOf( Date );
    // needs_sync should not be modified for ObservationPhoto
    expect( mockObsPhoto.needs_sync ).toBeUndefined();
  } );

  test( "should update an ObservationSound record correctly", () => {
    markRecordUploaded( "obs123", "sound123", "ObservationSound", mockResponse, mockRealm );

    expect( mockRealm.objectForPrimaryKey ).toHaveBeenCalledWith( "Observation", "obs123" );
    expect( safeRealmWrite ).toHaveBeenCalledTimes( 1 );

    expect( mockObsSound.id ).toBe( 12345 );
    expect( mockObsSound._synced_at ).toBeInstanceOf( Date );
    // needs_sync should not be modified for ObservationSound
    expect( mockObsSound.needs_sync ).toBeUndefined();
  } );

  test( "should update a Photo record correctly with options.record", () => {
    const options = { record: mockPhoto };

    markRecordUploaded( "obs123", null, "Photo", mockResponse, mockRealm, options );

    expect( safeRealmWrite ).toHaveBeenCalledTimes( 1 );

    expect( mockPhoto.id ).toBe( 12345 );
    expect( mockPhoto._synced_at ).toBeInstanceOf( Date );
  } );

  test( "should throw error when record is not found", () => {
    expect( () => {
      markRecordUploaded( "obs123", "nonexistent", "ObservationPhoto", mockResponse, mockRealm );
    } ).toThrow( "Cannot find local Realm object to mark as updated" );
  } );

  test( "should retry on invalidated object error", () => {
    safeRealmWrite.mockImplementationOnce( () => {
      throw new Error( "Object has been invalidated or deleted" );
    } );

    markRecordUploaded( "obs123", null, "Observation", mockResponse, mockRealm );

    expect( mockRealm.objectForPrimaryKey ).toHaveBeenCalledTimes( 2 );
    expect( safeRealmWrite ).toHaveBeenCalledTimes( 2 );

    expect( mockObservation.id ).toBe( 12345 );
    expect( mockObservation._synced_at ).toBeInstanceOf( Date );
    expect( mockObservation.needs_sync ).toBe( false );
  } );

  test( "should attempt to retry on non-invalidation errors", () => {
    // Mock safeRealmWrite to throw a non-invalidation error
    safeRealmWrite.mockImplementationOnce( ( realm, callback, description ) => {
      const error = new Error( "Some other error" );
      error.message = `${description}: ${error.message}`;
      throw error;
    } );

    expect( () => {
      markRecordUploaded( "obs123", null, "Observation", mockResponse, mockRealm );
    } ).toThrow( /Some other error/ );

    // Only called once because error doesn't match invalidated pattern
    expect( safeRealmWrite ).toHaveBeenCalledTimes( 1 );
  } );
} );
