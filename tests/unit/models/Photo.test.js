import ImageResizer from "@bam.tech/react-native-image-resizer";
import { RealmContext } from "providers/contexts";
import Observation from "realmModels/Observation";
import ObservationPhoto from "realmModels/ObservationPhoto";
import Photo from "realmModels/Photo";

const { useRealm } = RealmContext;

const CAMERA_ORIGINAL = "file:///rotatedOriginalPhotos/original.jpg";
const SOURCE_PATH_ARG_INDEX = 0;
const OUTPUT_PATH_ARG_INDEX = 6;

describe( "Photo.new", ( ) => {
  it( "makes a computer vision copy alongside the upload copy", async ( ) => {
    const photo = await Photo.new( CAMERA_ORIGINAL );

    expect( photo.localFilePath ).toContain( "photoUploads" );
    expect( photo.cvFilePath ).toContain( "computerVisionSuggestions" );
  } );

  it( "makes both copies from the original, not from each other", async ( ) => {
    jest.clearAllMocks( );

    await Photo.new( CAMERA_ORIGINAL );

    const sourcesResized = ImageResizer.createResizedImage.mock.calls
      .map( args => args[SOURCE_PATH_ARG_INDEX] );
    expect( sourcesResized ).toEqual( [CAMERA_ORIGINAL, CAMERA_ORIGINAL] );
  } );

  it( "returns a photo without a cv copy when the original can't be resized", async ( ) => {
    const resize = ImageResizer.createResizedImage;
    const resizeSuccessfully = resize.getMockImplementation( );
    resize.mockImplementation( ( ...args ) => (
      args[OUTPUT_PATH_ARG_INDEX].includes( "computerVisionSuggestions" )
        ? Promise.reject( new Error( "unsupported image source" ) )
        : resizeSuccessfully( ...args )
    ) );

    try {
      const photo = await Photo.new( CAMERA_ORIGINAL );

      expect( photo.localFilePath ).toBeTruthy( );
      expect( photo.cvFilePath ).toBeNull( );
    } finally {
      resize.mockImplementation( resizeSuccessfully );
    }
  } );
} );

describe( "the computer vision copy's lifetime", ( ) => {
  it( "survives a Realm write, so a re-opened draft still scores full quality", async ( ) => {
    const realm = useRealm( );
    const obs = await Observation.new( );
    obs.observationPhotos = await ObservationPhoto.createObsPhotosWithPosition(
      [CAMERA_ORIGINAL],
      { position: 0, local: true },
    );
    const { cvFilePath } = obs.observationPhotos[0].photo;
    expect( cvFilePath ).toContain( "computerVisionSuggestions" );

    const saved = await Observation.saveLocalObservationForUpload( obs, realm );

    expect( saved.observationPhotos[0].photo.localFilePath ).toBeTruthy( );
    expect( saved.observationPhotos[0].photo.cvFilePath ).toEqual( cvFilePath );
  } );
} );
