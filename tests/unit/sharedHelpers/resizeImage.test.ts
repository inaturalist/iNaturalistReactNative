import ImageResizer from "@bam.tech/react-native-image-resizer";
import { computerVisionPath } from "appConstants/paths";
import flattenUploadParams from "components/Suggestions/helpers/flattenUploadParams";
import { FileUpload } from "inaturalistjs";

const QUALITY_ARG_INDEX = 4;

const qualityOfLastResize = ( ) => {
  const { calls } = ( ImageResizer.createResizedImage as jest.Mock ).mock;
  return calls[calls.length - 1][QUALITY_ARG_INDEX];
};

describe( "resizeImage", ( ) => {
  beforeEach( ( ) => {
    jest.clearAllMocks( );
  } );

  describe( "the copy we send to computer vision", ( ) => {
    it( "is encoded at full quality", async ( ) => {
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
