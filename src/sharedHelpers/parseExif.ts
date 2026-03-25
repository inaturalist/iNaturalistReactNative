import * as Exify from "@lodev09/react-native-exify";
import { toZonedTime } from "date-fns-tz";
import { readExif, writeLocation } from "react-native-exif-reader";
import { formatISONoTimezone } from "sharedHelpers/dateAndTime";

class UsePhotoExifDateFormatError extends Error {}

const normalizeOffsetToMilliseconds = ( offsetTime?: string ): number | null => {
  if ( offsetTime == null ) return null;
  if ( typeof offsetTime !== "string" ) return null;

  // Common patterns:
  // +01:00
  // -07:00
  // Z
  if ( offsetTime === "Z" || offsetTime === "z" ) return 0;

  const match = offsetTime.match( /^([+-])(\d{2}):?(\d{2})$/ );
  if ( !match ) return null;

  const sign = match[1] === "+"
    ? 1
    : -1;
  const hours = Number( match[2] );
  const minutes = Number( match[3] );
  return sign * ( ( hours * 60 + minutes ) * 60 * 1000 );
};

const normalizeSubSecToMilliseconds = ( subSec?: string ): number => {
  if ( subSec == null ) return 0;
  const s = typeof subSec === "string"
    ? subSec
    : `${subSec}`;
  const digits = s.match( /^\d+$/ )
    ? s
    : "";
  if ( !digits ) return 0;

  // EXIF fractions are not guaranteed to be milliseconds; we only need ms precision.
  // - "1" -> "100"
  // - "12" -> "120"
  // - "1234" -> "123"
  const msString = digits.padEnd( 3, "0" ).slice( 0, 3 );
  return Number( msString );
};

// Normalizes EXIF date/time tags to the same string format that
// `parseExifDateToLocalTimezone` historically expects:
//   "YYYY-MM-DDTHH:mm:ss.SSS" (no timezone suffix)
const normalizeExifDateToLegacyFormat = ( tags: any ): string | null => {
  const dateTime
    = tags?.DateTimeOriginal || tags?.DateTimeDigitized || tags?.DateTime;
  if ( !dateTime || typeof dateTime !== "string" ) return null;

  const offsetTime
    = tags?.OffsetTimeOriginal || tags?.OffsetTimeDigitized || tags?.OffsetTime;
  const offsetMs = normalizeOffsetToMilliseconds( offsetTime );

  const subSec
    = tags?.SubSecTimeOriginal || tags?.SubSecTimeDigitized || tags?.SubSecTime;
  const msFromSubSec = normalizeSubSecToMilliseconds( subSec );

  // Expected inputs:
  // - "2018:03:07 08:19:49"
  // - "2018-03-07 08:19:49"
  // - "2018:03:07T08:19:49"
  // - "2018-03-07T08:19:49"
  // Optional subseconds are usually separate; we still support ".<digits>" if present.
  const match = dateTime.match(
    /^(\d{4})[:\-](\d{2})[:\-](\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/,
  );
  if ( !match ) return null;

  const year = Number( match[1] );
  const month = Number( match[2] );
  const day = Number( match[3] );
  const hour = Number( match[4] );
  const minute = Number( match[5] );
  const second = Number( match[6] );

  const msFromDateString = match[7]
    ? normalizeSubSecToMilliseconds( match[7] )
    : null;
  const ms = msFromDateString != null
    ? msFromDateString
    : msFromSubSec;

  // If we have an offset, treat the EXIF datetime as a local time at that offset and
  // convert to UTC. Otherwise we treat the EXIF datetime as UTC to match the previous
  // (react-native-exif-reader) behavior.
  const utcMs
    = offsetMs != null
      ? Date.UTC( year, month - 1, day, hour, minute, second, ms ) - offsetMs
      : Date.UTC( year, month - 1, day, hour, minute, second, ms );

  return new Date( utcMs ).toISOString().replace( /Z$/, "" );
};

// https://wbinnssmith.com/blog/subclassing-error-in-modern-javascript/
Object.defineProperty( UsePhotoExifDateFormatError.prototype, "name", {
  value: "UsePhotoExifDateFormatError",
} );

// Parses EXIF date time into a date object
export const parseExifDateToLocalTimezone = ( datetime: string ): Date | null => {
  if ( !datetime ) return null;

  // We intentionally interpret EXIF datetime as "GMT/UTC wall time" (not the
  // user's local timezone) and later format as an ISO string without timezone.
  const isoDate = `${datetime}Z`;
  const zonedDate = toZonedTime( isoDate, "GMT" );

  if ( !zonedDate || zonedDate.toString( ).match( /invalid/i ) ) {
    throw new UsePhotoExifDateFormatError( "Date was not formatted correctly" );
  }

  return zonedDate;
};

// Parses EXIF date time into a date object
export const parseExif = async ( photoUri?: string ): Promise<object | null> => {
  try {
    if ( !photoUri ) return null;
    const tags: any = await Exify.read( photoUri );
  } catch ( e ) {
    console.error( e, "Couldn't parse EXIF" );
    return null;
  }
};

export interface ExifToWrite {
  latitude?: number | null;
  longitude?: number | null;
  positional_accuracy?: number | null;
}

export const writeExifToFile = async ( photoUri?: string, exif: ExifToWrite ):
Promise<object | null> => {
  try {
    if ( !photoUri ) return null;

    // Exify uses standard EXIF keys, not iNat's internal field names.
    const tags: any = {};
    if ( typeof exif?.latitude === "number" ) tags.GPSLatitude = exif.latitude;
    if ( typeof exif?.longitude === "number" ) tags.GPSLongitude = exif.longitude;
    if ( typeof exif?.positional_accuracy === "number" ) {
      tags.GPSHPositioningError = exif.positional_accuracy;
    }

    return Exify.write( photoUri, tags );
  } catch ( e ) {
    console.error( e, "Couldn't write EXIF" );
    return null;
  }
};

export const formatExifDateAsString = ( datetime: string ): string => {
  const zonedDate = parseExifDateToLocalTimezone( datetime );
  // this returns a string, in the same format as photos which fall back to the
  // photo timestamp instead of exif data
  return formatISONoTimezone( zonedDate );
};

// Parse the EXIF of all photos - fill out details (lat/lng/date) from all of these,
// in case the first photo is missing EXIF
export const readExifFromMultiplePhotos = async ( photoUris: string[] ): Promise<object> => {
  const unifiedExif: {
    latitude?: number;
    longitude?: number;
    observed_on_string?: string | null;
    positional_accuracy?: number;
  } = {};

  const responses = await Promise.allSettled( photoUris.map( Exify.read ) );
  console.log( "responses", responses );
  const allExifPhotos = responses
    .filter( r => r.status === "fulfilled" )
    .filter( r => r.value )
    .map( r => r.value );

  allExifPhotos
    .filter( x => x )
    .forEach( currentPhotoExif => {
      console.log( "currentPhotoExif", currentPhotoExif );
      // TODO: TS says currentPhotoExif could be null, but the filters should exclude null ?
      if ( !currentPhotoExif ) return;

      const {
        GPSLatitude,
        GPSLongitude,
        GPSHPositioningError,
      } = currentPhotoExif;

      const date = normalizeExifDateToLegacyFormat( currentPhotoExif );

      if ( !unifiedExif.latitude ) {
        unifiedExif.latitude = GPSLatitude;
      }
      if ( !unifiedExif.longitude ) {
        unifiedExif.longitude = GPSLongitude;
      }
      if ( !unifiedExif.observed_on_string ) {
        unifiedExif.observed_on_string = formatExifDateAsString( date ) || null;
      }
      if ( GPSHPositioningError && !unifiedExif.positional_accuracy ) {
        unifiedExif.positional_accuracy = GPSHPositioningError;
      }
    } );
  return unifiedExif;
};
