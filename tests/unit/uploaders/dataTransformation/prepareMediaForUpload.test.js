import { FileUpload } from "inaturalistjs";
import ObservationPhoto from "realmModels/ObservationPhoto.ts";
import ObservationSound from "realmModels/ObservationSound";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import {
  prepareMediaForUpload
} from "uploaders";

jest.mock( "realmModels/ObservationPhoto", () => ( {
  mapPhotoForUpload: jest.fn(),
  mapPhotoForAttachingToObs: jest.fn(),
  mapPhotoForUpdating: jest.fn()
} ) );

jest.mock( "realmModels/ObservationSound", () => ( {
  mapSoundForUpload: jest.fn(),
  mapSoundForAttachingToObs: jest.fn()
} ) );

const mockPhoto = factory( "LocalPhoto", {
  localFilePath: "file://photo.jpg"
} );

const mockObservationPhoto = factory( "LocalObservationPhoto", {
  photo: mockPhoto
} );

const mockObservation = factory( "LocalObservation", {
  id: faker.number.int(),
  observationPhotos: [mockObservationPhoto]
} );

const mockObservationSound = factory( "LocalObservationSound", {
  file_url: "https://example.com/sound.mp3"
} );

describe( "prepareMediaForUpload", () => {
  beforeEach( () => {
    jest.clearAllMocks();

    ObservationPhoto.mapPhotoForUpload.mockReturnValue( {
      file: new FileUpload( {
        uri: mockPhoto.localFilePath,
        name: mockPhoto.localFilePath,
        type: "image/jpeg"
      } )
    } );

    ObservationPhoto.mapPhotoForAttachingToObs.mockReturnValue( {
      observation_photo: {
        uuid: mockObservationPhoto.uuid,
        observation_id: mockObservation.id,
        photo_id: mockPhoto.id,
        position: mockObservationPhoto.position
      }
    } );

    ObservationPhoto.mapPhotoForUpdating.mockReturnValue( {
      id: mockObservationPhoto.uuid,
      observation_photo: {
        observation_id: mockObservation.id,
        position: mockObservationPhoto.position
      }
    } );

    ObservationSound.mapSoundForUpload.mockReturnValue( {
      uuid: mockObservationSound.uuid,
      file: new FileUpload( {
        uri: mockObservationSound.sound.file_url,
        name: `${mockObservationSound.uuid}.m4a`,
        type: "audio/m4a"
      } )
    } );

    ObservationSound.mapSoundForAttachingToObs.mockReturnValue( {
      "observation_sound[observation_id]": mockObservation.id,
      "observation_sound[sound_id]": mockObservationSound.id,
      "observation_sound[uuid]": mockObservationSound.uuid
    } );
  } );

  test( "should map Photo upload", () => {
    const observationId = null;
    const result = prepareMediaForUpload(
      mockObservationPhoto,
      "Photo",
      "upload",
      observationId
    );

    expect( ObservationPhoto.mapPhotoForUpload ).toHaveBeenCalledWith(
      mockObservationPhoto
    );

    expect( result ).toEqual( {
      file: new FileUpload( {
        uri: mockPhoto.localFilePath,
        name: mockPhoto.localFilePath,
        type: "image/jpeg"
      } )
    } );
  } );

  test( "should map ObservationPhoto attachment", () => {
    const result = prepareMediaForUpload(
      mockObservationPhoto,
      "ObservationPhoto",
      "attach",
      mockObservation.id
    );

    expect( ObservationPhoto.mapPhotoForAttachingToObs ).toHaveBeenCalledWith(
      mockObservation.id,
      expect.objectContaining( {
        uuid: mockObservationPhoto.uuid,
        photo: mockPhoto
      } )
    );

    expect( result ).toEqual( {
      observation_photo: {
        observation_id: mockObservation.id,
        photo_id: mockPhoto.id,
        uuid: mockObservationPhoto.uuid,
        position: mockObservationPhoto.position
      }
    } );
  } );

  test( "should map ObservationPhoto update", () => {
    const result = prepareMediaForUpload(
      mockObservationPhoto,
      "ObservationPhoto",
      "update",
      mockObservation.id
    );

    expect( ObservationPhoto.mapPhotoForUpdating ).toHaveBeenCalledWith(
      mockObservation.id,
      mockObservationPhoto
    );

    expect( result ).toEqual( {
      id: mockObservationPhoto.uuid,
      observation_photo: {
        observation_id: mockObservation.id,
        position: mockObservationPhoto.position
      }
    } );
  } );

  test( "should map ObservationSound upload", () => {
    const observationId = null;
    const result = prepareMediaForUpload(
      mockObservationSound,
      "ObservationSound",
      "upload",
      observationId
    );

    expect( ObservationSound.mapSoundForUpload ).toHaveBeenCalledWith(
      observationId,
      mockObservationSound
    );

    expect( result ).toEqual( {
      uuid: mockObservationSound.uuid,
      file: new FileUpload( {
        uri: mockObservationSound.sound.file_url,
        name: `${mockObservationSound.uuid}.m4a}`,
        type: "audio/m4a"
      } )
    } );
  } );

  test( "should map ObservationSound attachment", () => {
    const result = prepareMediaForUpload(
      mockObservationSound,
      "ObservationSound",
      "attach",
      mockObservation.id
    );

    expect( ObservationSound.mapSoundForAttachingToObs ).toHaveBeenCalledWith(
      mockObservation.id,
      mockObservationSound
    );

    expect( result ).toEqual( {
      "observation_sound[observation_id]": mockObservation.id,
      "observation_sound[sound_id]": mockObservationSound.id,
      "observation_sound[uuid]": mockObservationSound.uuid
    } );
  } );

  test( "should throw an error for unsupported media type", () => {
    expect( () => {
      prepareMediaForUpload(
        mockObservationPhoto,
        "UnsupportedType",
        "upload"
      );
    } ).toThrow( /Unsupported media type/ );
  } );

  test( "should throw an error for unsupported action", () => {
    expect( () => {
      prepareMediaForUpload(
        mockObservationPhoto,
        "Photo",
        "unsupportedAction"
      );
    } ).toThrow( /Unsupported media type.*or action/ );
  } );

  test( "should throw an error if attach observationId is required but not provided", () => {
    expect( () => {
      prepareMediaForUpload(
        mockObservationPhoto,
        "ObservationPhoto",
        "attach"
      );
    } ).toThrow( /Observation ID is required for attaching photos/ );
  } );

  test( "should throw an error if update observationId is required but not provided", () => {
    expect( () => {
      prepareMediaForUpload(
        mockObservationPhoto,
        "ObservationPhoto",
        "update"
      );
    } ).toThrow( /Observation ID is required for updating photos/ );
  } );
} );
