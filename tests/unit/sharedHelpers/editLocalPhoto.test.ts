import { photoUploadPath } from "appConstants/paths";
import { Images } from "react-native-nitro-image";
import editLocalPhoto from "sharedHelpers/editLocalPhoto";

describe( "editLocalPhoto", ( ) => {
  it( "crops the rotated image and saves it as a new file in photoUploads", async ( ) => {
    const cropped = { saveToFileAsync: jest.fn( ) };
    const rotated = { cropAsync: jest.fn( async ( ) => cropped ) };
    const original = { rotateAsync: jest.fn( async ( ) => rotated ) };
    // A partial stand-in for nitro-image's Image, with only the methods this edit calls
    jest.mocked( Images.loadFromFileAsync ).mockResolvedValueOnce( original as never );
    const sourcePath = `${photoUploadPath}/original.jpg`;

    const editedPath = await editLocalPhoto( sourcePath, {
      rotation: 90,
      cropRectangle: {
        startX: 10, startY: 20, endX: 30, endY: 40,
      },
    } );

    expect( Images.loadFromFileAsync ).toHaveBeenCalledWith( sourcePath );
    expect( original.rotateAsync ).toHaveBeenCalledWith( 90, false );
    expect( rotated.cropAsync ).toHaveBeenCalledWith( 10, 20, 30, 40 );
    expect( cropped.saveToFileAsync ).toHaveBeenCalledWith( editedPath, "jpg", 100 );
    expect( editedPath ).toMatch( new RegExp( `^${photoUploadPath}/.+\\.jpg$` ) );
    expect( editedPath ).not.toEqual( sourcePath );
  } );
} );
