import ImageResizer from "@bam.tech/react-native-image-resizer";
import { unlink } from "@dr.pogodin/react-native-fs";
import { photoUploadCopiesPath } from "appConstants/paths";
import withPhotoUploadCopy from "uploaders/utils/withPhotoUploadCopy";

const storedPhotoPath = "file://document/directory/path/photoUploads/photo1.jpg";
const copyPath = `${photoUploadCopiesPath}/photo1.jpg`;

const mockedCreateResizedImage = jest.mocked( ImageResizer.createResizedImage );
const mockedUnlink = jest.mocked( unlink );

describe( "withPhotoUploadCopy", ( ) => {
  beforeEach( ( ) => {
    mockedUnlink.mockClear( );
    mockedCreateResizedImage.mockClear( );
  } );

  it( "uploads a q90 copy of the stored photo and deletes the copy afterwards", async ( ) => {
    const upload = jest.fn( async ( uri: string ) => `uploaded ${uri}` );

    const result = await withPhotoUploadCopy( storedPhotoPath, upload );

    expect( mockedCreateResizedImage ).toHaveBeenCalledWith(
      storedPhotoPath,
      2048,
      2048,
      "JPEG",
      90,
      0,
      photoUploadCopiesPath,
      true,
      { mode: "contain", onlyScaleDown: true },
    );
    expect( upload ).toHaveBeenCalledWith( copyPath );
    expect( result ).toEqual( `uploaded ${copyPath}` );
    expect( mockedUnlink ).toHaveBeenCalledWith( copyPath );
  } );

  it( "deletes the copy and rethrows when the upload fails", async ( ) => {
    const upload = jest.fn( async ( ) => { throw new Error( "Network Error" ); } );

    await expect( withPhotoUploadCopy( storedPhotoPath, upload ) )
      .rejects.toThrow( "Network Error" );

    expect( mockedUnlink ).toHaveBeenCalledWith( copyPath );
  } );

  it( "uploads the stored photo when the copy cannot be made", async ( ) => {
    mockedCreateResizedImage.mockRejectedValueOnce( new Error( "Resizer Error" ) );
    const upload = jest.fn( async ( ) => "uploaded" );

    await withPhotoUploadCopy( storedPhotoPath, upload );

    expect( upload ).toHaveBeenCalledWith( storedPhotoPath );
    expect( mockedUnlink ).not.toHaveBeenCalled( );
  } );

  it( "refuses to upload a photo that has no local file", async ( ) => {
    const upload = jest.fn( );

    await expect( withPhotoUploadCopy( undefined, upload ) )
      .rejects.toThrow( "Cannot upload photo: it has no local file" );

    expect( upload ).not.toHaveBeenCalled( );
    expect( mockedCreateResizedImage ).not.toHaveBeenCalled( );
  } );
} );
