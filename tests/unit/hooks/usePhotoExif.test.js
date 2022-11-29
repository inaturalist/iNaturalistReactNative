import { renderHook, waitFor } from "@testing-library/react-native";
import faker from "faker";
import { useState } from "react";
import { readExif } from "react-native-exif-reader";
import { parseExifDateTime, usePhotoExif } from "sharedHooks/usePhotoExif";

// Expected EXIF metadata of the above file

// Note that react-native-exif-reader returns dates as strings in a format
// that are standardized but really particular
const EXPECTED_EXIF_DATE = "2018-03-07T08:19:49.000";
const EXPECTED_EXIF_LATITUDE = 38.07480555555556;
const EXPECTED_EXIF_LONGITUDE = -122.85112777777778;
const EXPECTED_EXIF_POSITIONAL_ACCURACY = 5;

const usePhotoExifWrapper = () => {
  const [uri, setUri] = useState( null );
  const exif = usePhotoExif( uri );

  return { setUri, exif };
};

// Change the mock implementation to return the values we want
const mockReadExif = jest.fn( async _photoUri => ( {
  longitude: EXPECTED_EXIF_LONGITUDE,
  latitude: EXPECTED_EXIF_LATITUDE,
  positional_accuracy: EXPECTED_EXIF_POSITIONAL_ACCURACY,
  date: EXPECTED_EXIF_DATE
} ) );
readExif.mockImplementation( mockReadExif );

// We can't really test the behavior of a native module in a unit test, so
// here we're just mocking that module and testing the hook
describe( "usePhotoExif", ( ) => {
  it( "should call readExif in react-native-exif-reader", async ( ) => {
    expect( mockReadExif ).not.toHaveBeenCalled( );
    const { result } = renderHook( () => usePhotoExifWrapper() );
    await waitFor( ( ) => {
      result.current.setUri( faker.image.imageUrl( ) );
      expect( mockReadExif ).toHaveBeenCalled( );
    } );
  } );

  it( "should return the values it gets from react-native-exif-reader", async ( ) => {
    const { result } = renderHook( () => usePhotoExifWrapper() );
    await waitFor( ( ) => {
      result.current.setUri( faker.image.imageUrl( ) );
      // This repeats the previous test, but it ensures that waitFor waits
      // until our mock function was actually called before trying to assert
      // stuff based in its return value
      expect( mockReadExif ).toHaveBeenCalled( );
    } );
    expect( result.current.exif ).toBeTruthy( );
    const { exif } = result.current;
    expect( exif.date ).toEqual( EXPECTED_EXIF_DATE );
    expect( exif.latitude ).toEqual( EXPECTED_EXIF_LATITUDE );
    expect( exif.longitude ).toEqual( EXPECTED_EXIF_LONGITUDE );
    expect( exif.positional_accuracy ).toEqual( EXPECTED_EXIF_POSITIONAL_ACCURACY );
  } );
} );

describe( "parseExifDateTime", ( ) => {
  it( "should parse a date string in the format react-native-exif-reader returns", ( ) => {
    const date = parseExifDateTime( EXPECTED_EXIF_DATE );
    expect( date ).toBeInstanceOf( Date );
    expect( date.getFullYear( ) ).toEqual( 2018 );
    expect( date.getMonth( ) ).toEqual( 2 );
    expect( date.getDate( ) ).toEqual( 7 );
  } );
} );
