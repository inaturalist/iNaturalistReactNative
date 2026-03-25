import * as Exify from "@lodev09/react-native-exify";
import {
  formatExifDateAsString,
  parseExifDateToLocalTimezone,
  readExifFromMultiplePhotos,
} from "sharedHelpers/parseExif";
import faker from "tests/helpers/faker";

// Expected EXIF metadata of the above file

// Note that previously react-native-exif-reader returned dates as strings in a format
// that are standardized but really particular, I added the parsing of exif dates into this
// particular format to parseExif
const EXPECTED_EXIF_DATE = "2018-03-07T08:19:49.000";
// Swift exif-reader parity: civil time from DateTimeOriginal + .SSS (no UTC shift)
const EXPECTED_OBSERVED_ON_STRING = "2018-03-07T08:19:49.000";
const EXPECTED_EXIF_LATITUDE = 38.07480555555556;
const EXPECTED_EXIF_LONGITUDE = -122.85112777777778;
const EXPECTED_EXIF_POSITIONAL_ACCURACY = 5;

// react-native-exify returns EXIF tags, not the app's normalized field names.
const MOCK_READ_EXIF_RESPONSE = {
  GPSLatitude: EXPECTED_EXIF_LATITUDE,
  GPSLongitude: EXPECTED_EXIF_LONGITUDE,
  GPSHPositioningError: EXPECTED_EXIF_POSITIONAL_ACCURACY,
  // exify returns DateTimeOriginal in EXIF format: "YYYY:MM:DD HH:mm:ss"
  DateTimeOriginal: "2018:03:07 08:19:49",
};

const MOCK_READ_EXIF_RESPONSE_OTHER_TIME_ZONE = {
  ...MOCK_READ_EXIF_RESPONSE,
  OffsetTimeOriginal: "+01:00",
};

describe( "parseExifDateToLocalTimezone", () => {
  it( "should parse a date string in the format react-native-exif-reader returns", () => {
    const date = parseExifDateToLocalTimezone( EXPECTED_EXIF_DATE );
    expect( date ).toBeInstanceOf( Date );
    expect( date.getFullYear() ).toEqual( 2018 );
    expect( date.getMonth() ).toEqual( 2 );
    expect( date.getDate() ).toEqual( 7 );
  } );
} );

describe( "formatExifDateAsString", () => {
  it( "should return date in a string format ready to upload to server", () => {
    const dateString = formatExifDateAsString( EXPECTED_EXIF_DATE );
    expect( typeof dateString ).toBe( "string" );
  } );
} );

describe( "readExifFromMultiplePhotos", ( ) => {
  beforeEach( ( ) => Exify.read.mockReset( ) );

  it( "should return an object if EXIF fails to parse for one photo", async ( ) => {
    Exify.read.mockRejectedValueOnce( new Error( "failed to catch test error" ) );
    const unified = await readExifFromMultiplePhotos( [faker.image.url()] );
    expect( unified ).toEqual( {} );
  } );

  it( "should merge coords/accuracy/date from one successful EXIF read", async ( ) => {
    Exify.read.mockResolvedValueOnce( MOCK_READ_EXIF_RESPONSE );
    const unified = await readExifFromMultiplePhotos( [faker.image.url()] );

    expect( unified.latitude ).toEqual( EXPECTED_EXIF_LATITUDE );
    expect( unified.longitude ).toEqual( EXPECTED_EXIF_LONGITUDE );
    expect( unified.positional_accuracy ).toEqual( EXPECTED_EXIF_POSITIONAL_ACCURACY );
    expect( unified.observed_on_string ).toEqual( EXPECTED_OBSERVED_ON_STRING );
  } );

  it( "should normalize bare filesystem paths for Exify (Android)", async ( ) => {
    const barePath = "/data/user/0/org.inaturalist.iNaturalistMobile/files/galleryPhotos/test.jpg";
    const expectedExifyUri = `file://${barePath}`;

    Exify.read.mockImplementation( async uri => {
      expect( uri ).toEqual( expectedExifyUri );
      return MOCK_READ_EXIF_RESPONSE;
    } );

    const unified = await readExifFromMultiplePhotos( [barePath] );
    expect( unified.latitude ).toEqual( EXPECTED_EXIF_LATITUDE );
    expect( unified.longitude ).toEqual( EXPECTED_EXIF_LONGITUDE );
  } );

  it( "should handle EXIF datetime with a different timezone offset", async ( ) => {
    Exify.read
      .mockRejectedValueOnce( new Error( "failed to catch test error" ) )
      .mockResolvedValueOnce( MOCK_READ_EXIF_RESPONSE_OTHER_TIME_ZONE );
    const unified = await readExifFromMultiplePhotos( [
      faker.image.url(),
      faker.image.url(),
    ] );

    // Same wall clock as iOS (offset tags do not change the formatted civil time)
    expect( unified.observed_on_string ).toEqual( "2018-03-07T08:19:49.000" );
    expect( unified.latitude ).toEqual( EXPECTED_EXIF_LATITUDE );
    expect( unified.longitude ).toEqual( EXPECTED_EXIF_LONGITUDE );
    expect( unified.positional_accuracy ).toEqual( EXPECTED_EXIF_POSITIONAL_ACCURACY );
  } );
} );
