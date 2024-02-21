import faker from "tests/helpers/faker";
import { readExif } from "react-native-exif-reader";
import {
  formatExifDateAsString,
  parseExif,
  parseExifDateToLocalTimezone
} from "sharedHelpers/parseExif";

// Expected EXIF metadata of the above file

// Note that react-native-exif-reader returns dates as strings in a format
// that are standardized but really particular
const EXPECTED_EXIF_DATE = "2018-03-07T08:19:49.000";
const EXPECTED_EXIF_LATITUDE = 38.07480555555556;
const EXPECTED_EXIF_LONGITUDE = -122.85112777777778;
const EXPECTED_EXIF_POSITIONAL_ACCURACY = 5;

// Change the mock implementation to return the values we want
const mockReadExif = jest.fn( async _photoUri => ( {
  longitude: EXPECTED_EXIF_LONGITUDE,
  latitude: EXPECTED_EXIF_LATITUDE,
  positional_accuracy: EXPECTED_EXIF_POSITIONAL_ACCURACY,
  date: EXPECTED_EXIF_DATE
} ) );
readExif.mockImplementation( mockReadExif );

describe( "parseExifDateToLocalTimezone", () => {
  it( "should parse a date string in the format react-native-exif-reader returns", () => {
    const date = parseExifDateToLocalTimezone( EXPECTED_EXIF_DATE );
    expect( date ).toBeInstanceOf( Date );
    expect( date.getFullYear() ).toEqual( 2018 );
    expect( date.getMonth() ).toEqual( 2 );
    expect( date.getDate() ).toEqual( 7 );
  } );
} );

describe( "parseExif", () => {
  it( "should parse and return exif data when given a photo uri", async () => {
    const exif = await parseExif( faker.image.url() );
    expect( exif.date ).toEqual( EXPECTED_EXIF_DATE );
    expect( exif.latitude ).toEqual( EXPECTED_EXIF_LATITUDE );
    expect( exif.longitude ).toEqual( EXPECTED_EXIF_LONGITUDE );
    expect( exif.positional_accuracy ).toEqual( EXPECTED_EXIF_POSITIONAL_ACCURACY );
  } );
} );

describe( "formatExifDateAsString", () => {
  it( "should return date in a string format ready to upload to server", () => {
    const dateString = formatExifDateAsString( EXPECTED_EXIF_DATE );
    expect( typeof dateString ).toBe( "string" );
  } );
} );
