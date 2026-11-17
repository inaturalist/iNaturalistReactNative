import * as Exify from "@lodev09/react-native-exify";
import { photoUploadPath } from "appConstants/paths";
import { Images } from "react-native-nitro-image";
import editLocalPhoto, { pickExifToCopy } from "sharedHelpers/editLocalPhoto";

const mockImages = ( ) => {
  const cropped = { saveToFileAsync: jest.fn( ) };
  const upright = { cropAsync: jest.fn( async ( ) => cropped ), saveToFileAsync: jest.fn( ) };
  const original = { rotateAsync: jest.fn( async ( ) => upright ) };
  // A partial stand-in for nitro-image's Image, with only the methods this edit calls
  jest.mocked( Images.loadFromFileAsync ).mockResolvedValueOnce( original as never );
  return { original, upright, cropped };
};

const sourcePath = `${photoUploadPath}/original.jpg`;

describe( "editLocalPhoto", ( ) => {
  beforeEach( ( ) => {
    jest.mocked( Exify.read ).mockReset( );
    jest.mocked( Exify.write ).mockReset( );
  } );

  it( "crops the rotated image and saves it as a new file in photoUploads", async ( ) => {
    const { original, upright, cropped } = mockImages( );

    const editedPath = await editLocalPhoto( sourcePath, {
      rotation: 90,
      cropRectangle: {
        startX: 10, startY: 20, endX: 30, endY: 40,
      },
    } );

    expect( Images.loadFromFileAsync ).toHaveBeenCalledWith( sourcePath );
    expect( original.rotateAsync ).toHaveBeenCalledWith( 90, false );
    expect( upright.cropAsync ).toHaveBeenCalledWith( 10, 20, 30, 40 );
    expect( cropped.saveToFileAsync ).toHaveBeenCalledWith( editedPath, "jpg", 100 );
    expect( editedPath ).toMatch( new RegExp( `^${photoUploadPath}/.+\\.jpg$` ) );
    expect( editedPath ).not.toEqual( sourcePath );
  } );

  it( "redraws the image upright before cropping even without rotation", async ( ) => {
    const { original, upright } = mockImages( );

    await editLocalPhoto( sourcePath, {
      rotation: 0,
      cropRectangle: {
        startX: 10, startY: 20, endX: 30, endY: 40,
      },
    } );

    expect( original.rotateAsync ).toHaveBeenCalledWith( 0, false );
    expect( upright.cropAsync ).toHaveBeenCalledWith( 10, 20, 30, 40 );
  } );

  it( "copies capture EXIF from the original to the edited file", async ( ) => {
    mockImages( );
    jest.mocked( Exify.read ).mockResolvedValueOnce( {
      DateTimeOriginal: "2026:05:01 10:11:12",
      GPSLatitude: 37.77,
      Orientation: 6,
    } );

    const editedPath = await editLocalPhoto( sourcePath, { rotation: 90 } );

    expect( Exify.read ).toHaveBeenCalledWith( `file://${sourcePath}` );
    expect( Exify.write ).toHaveBeenCalledWith( `file://${editedPath}`, {
      DateTimeOriginal: "2026:05:01 10:11:12",
      GPSLatitude: 37.77,
    } );
  } );

  it( "still returns the edited photo if copying EXIF fails", async ( ) => {
    mockImages( );
    jest.mocked( Exify.read ).mockRejectedValueOnce( new Error( "unreadable" ) );

    const editedPath = await editLocalPhoto( sourcePath, { rotation: 90 } );

    expect( editedPath ).toMatch( new RegExp( `^${photoUploadPath}/.+\\.jpg$` ) );
    expect( Exify.write ).not.toHaveBeenCalled( );
  } );
} );

describe( "pickExifToCopy", ( ) => {
  it( "keeps capture date, camera, and GPS tags", ( ) => {
    const tags = {
      DateTimeOriginal: "2026:05:01 10:11:12",
      OffsetTimeOriginal: "-07:00",
      Make: "Apple",
      Model: "iPhone 17 Pro",
      GPSLatitude: 37.77,
      GPSLatitudeRef: "N",
      GPSHPositioningError: 5,
    };
    expect( pickExifToCopy( tags ) ).toEqual( tags );
  } );

  it( "drops tags that describe the old pixels", ( ) => {
    expect( pickExifToCopy( {
      Orientation: 6,
      PixelXDimension: 2048,
      PixelYDimension: 1536,
      PixelWidth: 2048,
      ColorModel: "RGB",
    } ) ).toEqual( {} );
  } );
} );
