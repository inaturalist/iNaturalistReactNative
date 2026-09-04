import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import {
  clearObservationUploadError,
  persistObservationUploadError,
} from "uploaders/utils/persistUploadError";

jest.mock( "sharedHelpers/safeRealmWrite", () => jest.fn( ( _realm, fn ) => fn( ) ) );

describe( "persistUploadError", () => {
  let mockObservation;
  let mockRealm;

  beforeEach( () => {
    jest.clearAllMocks();
    mockObservation = {
      uuid: "obs-uuid",
      uploadErrorMessage: "old error",
    };
    mockRealm = {
      isClosed: false,
    };
  } );

  describe( "persistObservationUploadError", () => {
    it( "writes uploadErrorMessage on the observation", () => {
      persistObservationUploadError(
        mockRealm,
        mockObservation,
        "Media upload failed: network down",
      );
      expect( mockObservation.uploadErrorMessage ).toBe( "Media upload failed: network down" );
      expect( safeRealmWrite ).toHaveBeenCalled( );
    } );

    it( "does not throw when the write fails", () => {
      safeRealmWrite.mockImplementationOnce( () => {
        throw new Error( "persisting observation upload error: write failed" );
      } );

      expect( () => {
        persistObservationUploadError(
          mockRealm,
          mockObservation,
          "Media upload failed: network down",
        );
      } ).not.toThrow( );
    } );
  } );

  describe( "clearObservationUploadError", () => {
    it( "clears uploadErrorMessage on the observation", () => {
      clearObservationUploadError( mockRealm, mockObservation );
      expect( mockObservation.uploadErrorMessage ).toBe( null );
    } );

    it( "skips the write when uploadErrorMessage is already empty", () => {
      mockObservation.uploadErrorMessage = null;
      clearObservationUploadError( mockRealm, mockObservation );
      expect( safeRealmWrite ).not.toHaveBeenCalled( );
    } );

    it( "does not throw when the write fails", () => {
      safeRealmWrite.mockImplementationOnce( () => {
        throw new Error( "clearing observation upload error: write failed" );
      } );

      expect( () => {
        clearObservationUploadError( mockRealm, mockObservation );
      } ).not.toThrow( );
    } );
  } );
} );
