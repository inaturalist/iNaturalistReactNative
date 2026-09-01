import ImageResizer from "@bam.tech/react-native-image-resizer";
import { copyAssetsFileIOS } from "@dr.pogodin/react-native-fs";
import { computerVisionPath } from "appConstants/paths";
import flattenUploadParams from "components/Suggestions/helpers/flattenUploadParams";
import { FileUpload } from "inaturalistjs";
import { Platform } from "react-native";
import Photo from "realmModels/Photo";

const QUALITY_ARG_INDEX = 4;
const COMPRESSION_ARG_INDEX = 5;

const qualityOfLastResize = ( ) => {
  const { calls } = ( ImageResizer.createResizedImage as jest.Mock ).mock;
  return calls[calls.length - 1][QUALITY_ARG_INDEX];
};

describe( "resizeImage", ( ) => {
  beforeEach( ( ) => {
    jest.clearAllMocks( );
  } );

  describe( "the copy we save for upload", ( ) => {
    it( "is encoded at quality 90", async ( ) => {
      await Photo.resizeImageForUpload( "file:///photo.jpg" );

      expect( qualityOfLastResize( ) ).toBe( 90 );
    } );

    it( "is encoded at quality 90 when copied from an iOS local identifier", async ( ) => {
      const originalPlatform = Platform.OS;
      Platform.OS = "ios";

      await Photo.resizeImageForUpload( "ph://ABC-123" );

      Platform.OS = originalPlatform;

      const [compression] = ( copyAssetsFileIOS as jest.Mock )
        .mock.calls[0].slice( COMPRESSION_ARG_INDEX );
      expect( compression ).toBeCloseTo( 0.9 );
    } );
  } );

  describe( "the copy we send to computer vision", ( ) => {
    it( "is still encoded at full quality", async ( ) => {
      await flattenUploadParams( "file:///photo.jpg" );

      expect( qualityOfLastResize( ) ).toBe( 100 );
    } );

    it( "is not re-encoded when it was already made at capture time", async ( ) => {
      const cvUri = `file://${computerVisionPath}/photo.jpg`;

      const params = await flattenUploadParams( cvUri );

      expect( ImageResizer.createResizedImage ).not.toHaveBeenCalled( );
      // inaturalistjs is auto-mocked, so assert on what FileUpload was handed
      expect( ( FileUpload as unknown as jest.Mock ).mock.calls[0][0].uri ).toBe( cvUri );
      expect( params.image ).toBeDefined( );
    } );
  } );
} );
