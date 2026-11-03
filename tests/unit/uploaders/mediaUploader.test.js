import { createOrUpdateEvidence } from "api/observations";
import inatjs from "inaturalistjs";
import prepareMediaForUpload from "uploaders/dataTransformation/prepareMediaForUpload";
import { attachMediaToObservation, uploadObservationMedia } from "uploaders/mediaUploader";
import { trackEvidenceUpload } from "uploaders/utils/progressTracker";
import withPhotoUploadCopy from "uploaders/utils/withPhotoUploadCopy";

jest.mock( "api/observations" );
jest.mock( "inaturalistjs" );
jest.mock( "uploaders/dataTransformation/prepareMediaForUpload" );
jest.mock( "uploaders/utils/realmSync" );
jest.mock( "uploaders/utils/progressTracker" );
jest.mock( "uploaders/utils/withPhotoUploadCopy" );

const mockedCreateOrUpdateEvidence = jest.mocked( createOrUpdateEvidence );
const mockedPrepareMediaForUpload = jest.mocked( prepareMediaForUpload );
const mockedTrackEvidenceUpload = jest.mocked( trackEvidenceUpload );
const mockedWithPhotoUploadCopy = jest.mocked( withPhotoUploadCopy );

describe( "mediaUploader", () => {
  beforeEach( () => {
    jest.resetAllMocks();

    const mockProgress = {
      attached: jest.fn(),
      uploaded: jest.fn(),
    };
    mockedTrackEvidenceUpload.mockReturnValue( mockProgress );
    mockedCreateOrUpdateEvidence.mockResolvedValue( { id: 123 } );
    mockedPrepareMediaForUpload.mockImplementation( ( evidence, type, action, observationId ) => ( {
      id: evidence.uuid,
      type,
      action,
      observation_id: observationId,
      file_url: evidence.url,
    } ) );
  } );

  describe( "uploadObservationMedia", () => {
    it( "should upload photos and sounds in parallel", async () => {
      const observation = {
        uuid: "obs-uuid-123",
        observationPhotos: [
          {
            wasSynced: () => false,
            photo: { uuid: "photo-uuid-1", url: "photo1.jpg" },
          },
        ],
        observationSounds: [
          {
            wasSynced: () => false,
            uuid: "sound-uuid-1",
            sound: { file_url: "file://soundUploads/sound1.mp3" },
          },
        ],
      };
      const options = { api_token: "test-token" };
      const realm = {};

      const result = await uploadObservationMedia( observation, options, realm );

      expect( createOrUpdateEvidence ).toHaveBeenCalledTimes( 2 );
      expect( result ).toEqual( {
        unsyncedObservationPhotos: observation.observationPhotos,
        modifiedObservationPhotos: [],
        unsyncedObservationSounds: observation.observationSounds,
      } );
    } );

    it( "should handle empty media arrays", async () => {
      const observation = {
        uuid: "obs-uuid-123",
        observationPhotos: [],
        observationSounds: [],
      };
      const options = { api_token: "test-token" };
      const realm = {};

      const result = await uploadObservationMedia( observation, options, realm );

      expect( createOrUpdateEvidence ).not.toHaveBeenCalled();
      expect( result ).toEqual( {
        unsyncedObservationPhotos: [],
        modifiedObservationPhotos: [],
        unsyncedObservationSounds: [],
      } );
    } );

    it( "should handle photos that need updates", async () => {
      const observation = {
        uuid: "obs-uuid-123",
        observationPhotos: [
          {
            wasSynced: () => true,
            needsSync: () => true,
            photo: { uuid: "photo-uuid-1", url: "photo1.jpg" },
          },
        ],
        observationSounds: [],
      };
      const options = { api_token: "test-token" };
      const realm = {};

      const result = await uploadObservationMedia( observation, options, realm );

      expect( createOrUpdateEvidence ).not.toHaveBeenCalled();
      expect( result.modifiedObservationPhotos.length ).toBe( 1 );
    } );

    it( "should handle missing photo objects gracefully", async () => {
      const observation = {
        uuid: "obs-uuid-123",
        observationPhotos: [
          {
            wasSynced: () => false,
            get photo() {
              throw new Error( "No object with key photo-uuid-missing" );
            },
          },
          {
            wasSynced: () => false,
            photo: { uuid: "photo-uuid-1", url: "photo1.jpg" },
          },
        ],
        observationSounds: [],
      };
      const options = { api_token: "test-token" };
      const realm = {};

      const result = await uploadObservationMedia( observation, options, realm );

      expect( createOrUpdateEvidence ).toHaveBeenCalledTimes( 1 );
      expect( result.unsyncedObservationPhotos.length ).toBe( 2 );
    } );
  } );

  describe( "attachMediaToObservation", () => {
    it( "should attach photos and sounds to an observation", async () => {
      const observationUUID = "obs-uuid-123";
      const mediaItems = {
        unsyncedObservationPhotos: [
          { uuid: "photo-uuid-1", url: "photo1.jpg" },
        ],
        modifiedObservationPhotos: [
          { uuid: "photo-uuid-2", url: "photo2.jpg" },
        ],
        unsyncedObservationSounds: [
          { uuid: "sound-uuid-1", url: "sound1.mp3" },
        ],
      };
      const options = { api_token: "test-token" };
      const realm = {};

      await attachMediaToObservation( observationUUID, mediaItems, options, realm );

      expect( createOrUpdateEvidence ).toHaveBeenCalledTimes( 3 );

      expect( mockedPrepareMediaForUpload ).toHaveBeenCalledWith(
        mediaItems.unsyncedObservationPhotos[0],
        "ObservationPhoto",
        "attach",
        observationUUID,
        undefined,
      );

      expect( mockedPrepareMediaForUpload ).toHaveBeenCalledWith(
        mediaItems.unsyncedObservationSounds[0],
        "ObservationSound",
        "attach",
        observationUUID,
        undefined,
      );

      expect( mockedPrepareMediaForUpload ).toHaveBeenCalledWith(
        mediaItems.modifiedObservationPhotos[0],
        "ObservationPhoto",
        "update",
        observationUUID,
        undefined,
      );

      expect( mockedCreateOrUpdateEvidence ).toHaveBeenCalledWith(
        inatjs.observation_photos.create,
        expect.any( Object ),
        options,
      );
      expect( mockedCreateOrUpdateEvidence ).toHaveBeenCalledWith(
        inatjs.observation_sounds.create,
        expect.any( Object ),
        options,
      );
      expect( mockedCreateOrUpdateEvidence ).toHaveBeenCalledWith(
        inatjs.observation_photos.update,
        expect.any( Object ),
        options,
      );
    } );

    it( "should handle empty media arrays", async () => {
      const observationUUID = "obs-uuid-123";
      const mediaItems = {
        unsyncedObservationPhotos: [],
        modifiedObservationPhotos: [],
        unsyncedObservationSounds: [],
      };
      const options = { api_token: "test-token" };
      const realm = {};

      await attachMediaToObservation( observationUUID, mediaItems, options, realm );

      expect( createOrUpdateEvidence ).not.toHaveBeenCalled();
    } );
  } );

  describe( "filterMediaForUpload", () => {
    it( "should correctly filter media for upload", async () => {
      const observation = {
        uuid: "obs-uuid-123",
        observationPhotos: [
          { wasSynced: () => false, photo: { uuid: "photo-uuid-1", url: "photo1.jpg" } },
          {
            wasSynced: () => true,
            needsSync: () => true,
            photo: { uuid: "photo-uuid-2", url: "photo2.jpg" },
          },
          {
            wasSynced: () => true,
            needsSync: () => false,
            photo: { uuid: "photo-uuid-3", url: "photo3.jpg" },
          },
        ],
        observationSounds: [
          {
            wasSynced: () => false,
            uuid: "sound-uuid-1",
            sound: { file_url: "file://soundUploads/sound1.mp3" },
          },
          {
            wasSynced: () => true,
            uuid: "sound-uuid-2",
            sound: { file_url: "file://soundUploads/sound2.mp3" },
          },
        ],
      };
      const options = { api_token: "test-token" };
      const realm = {};

      const result = await uploadObservationMedia( observation, options, realm );

      expect( result.unsyncedObservationPhotos.length ).toBe( 1 );
      expect( result.modifiedObservationPhotos.length ).toBe( 1 );
      expect( result.unsyncedObservationSounds.length ).toBe( 1 );
    } );
  } );

  describe( "progress tracking", () => {
    it( "should track progress for upload evidence operations", async () => {
      const observation = {
        uuid: "obs-uuid-123",
        observationPhotos: [
          { wasSynced: () => false, photo: { uuid: "photo-uuid-1", url: "photo1.jpg" } },
        ],
        observationSounds: [],
      };
      const options = { api_token: "test-token" };
      const realm = {};
      const mockProgress = {
        attached: jest.fn(),
        uploaded: jest.fn(),
      };
      mockedTrackEvidenceUpload.mockReturnValue( mockProgress );

      await uploadObservationMedia( observation, options, realm );

      expect( trackEvidenceUpload ).toHaveBeenCalledWith( "obs-uuid-123" );
      expect( mockProgress.uploaded ).toHaveBeenCalled();
      expect( mockProgress.attached ).not.toHaveBeenCalled();
    } );

    it( "should track progress for attach operations", async () => {
      const observationUUID = "obs-uuid-123";
      const mediaItems = {
        unsyncedObservationPhotos: [
          { uuid: "photo-uuid-1", url: "photo1.jpg" },
        ],
        modifiedObservationPhotos: [],
        unsyncedObservationSounds: [],
      };
      const options = { api_token: "test-token" };
      const realm = {};
      const mockProgress = {
        attached: jest.fn(),
        uploaded: jest.fn(),
      };
      mockedTrackEvidenceUpload.mockReturnValue( mockProgress );

      await attachMediaToObservation( observationUUID, mediaItems, options, realm );

      expect( trackEvidenceUpload ).toHaveBeenCalledWith( "obs-uuid-123" );
      expect( mockProgress.attached ).toHaveBeenCalled();
    } );
  } );

  describe( "photo upload copies", () => {
    const localFilePath = "file://document/directory/path/photoUploads/photo1.jpg";
    const copyUri = "file://caches/directory/path/photoUploadCopies/copy.jpg";

    beforeEach( () => {
      mockedWithPhotoUploadCopy.mockImplementation( ( _path, upload ) => upload( copyUri ) );
    } );

    it( "should send a new photo as an upload copy of its stored file", async () => {
      const photo = { uuid: "photo-uuid-1", localFilePath };
      const observation = {
        uuid: "obs-uuid-123",
        observationPhotos: [{ wasSynced: () => false, photo }],
        observationSounds: [],
      };

      await uploadObservationMedia( observation, {}, {} );

      expect( mockedWithPhotoUploadCopy )
        .toHaveBeenCalledWith( localFilePath, expect.any( Function ) );
      expect( mockedPrepareMediaForUpload ).toHaveBeenCalledWith(
        photo,
        "Photo",
        "upload",
        null,
        copyUri,
      );
    } );

    it( "should not make upload copies when attaching or updating photos", async () => {
      const mediaItems = {
        unsyncedObservationPhotos: [{ uuid: "obs-photo-1", photo: { localFilePath } }],
        modifiedObservationPhotos: [{ uuid: "obs-photo-2", photo: { localFilePath } }],
        unsyncedObservationSounds: [],
      };

      await attachMediaToObservation( "obs-uuid-123", mediaItems, {}, {} );

      expect( mockedWithPhotoUploadCopy ).not.toHaveBeenCalled( );
      expect( createOrUpdateEvidence ).toHaveBeenCalledTimes( 2 );
    } );
  } );

  describe( "error handling", () => {
    it( "should handle API errors gracefully", async () => {
      const observation = {
        uuid: "obs-uuid-123",
        observationPhotos: [
          { wasSynced: () => false, photo: { uuid: "photo-uuid-1", url: "photo1.jpg" } },
        ],
        observationSounds: [],
      };
      const options = { api_token: "test-token" };
      const realm = {};
      mockedCreateOrUpdateEvidence.mockRejectedValue( new Error( "API Error" ) );

      await expect( uploadObservationMedia( observation, options, realm ) )
        .rejects.toThrow( "API Error" );
    } );

    it( "should filter out null photos", async () => {
      const observation = {
        uuid: "obs-uuid-123",
        observationPhotos: [
          {
            wasSynced: () => false,
            photo: null,
          },
        ],
        observationSounds: [],
      };
      const options = { api_token: "test-token" };
      const realm = {};

      const result = await uploadObservationMedia( observation, options, realm );

      expect( createOrUpdateEvidence ).not.toHaveBeenCalled();
      expect( result.unsyncedObservationPhotos.length ).toBe( 1 );
    } );
  } );
} );
