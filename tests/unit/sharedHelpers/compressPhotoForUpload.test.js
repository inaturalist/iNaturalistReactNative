import ImageResizer, { MOCK_RESIZER_CACHE_PATH } from "@bam.tech/react-native-image-resizer";
import compressPhotoForUpload from "sharedHelpers/compressPhotoForUpload";

describe( "compressPhotoForUpload", ( ) => {
  it( "compresses at q90 with no output path, so the copy lands in the OS cache", async ( ) => {
    const uri = await compressPhotoForUpload( "file:///photoUploads/abc.jpg" );

    expect( ImageResizer.createResizedImage ).toHaveBeenCalledWith(
      "file:///photoUploads/abc.jpg",
      2048, // maxWidth
      2048, // maxHeight
      "JPEG", // compressFormat
      90, // quality
      0, // rotation
      undefined, // outputPath
      true, // keep metadata
      { mode: "contain", onlyScaleDown: true },
    );
    expect( uri ).toBe( `${MOCK_RESIZER_CACHE_PATH}/abc.jpg` );
  } );
} );
