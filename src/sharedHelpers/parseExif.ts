import type { ExifTags } from "@lodev09/react-native-exify";
import * as Exify from "@lodev09/react-native-exify";
import { toZonedTime } from "date-fns-tz";
import { formatISONoTimezone } from "sharedHelpers/dateAndTime";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "parseExif.ts" );

class UsePhotoExifDateFormatError extends Error {}

const normalizeOffsetToMilliseconds = ( offsetTime?: string ): number | null => {
  if ( !offsetTime ) return null;

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

// Normalizes EXIF date/time tags to the same string format that
// `parseExifDateToLocalTimezone` historically expects:
//   "YYYY-MM-DDTHH:mm:ss" (no timezone suffix)
const normalizeExifDateToLegacyFormat = ( tags: ExifTags ): string | null => {
  const dateTime
    = tags?.DateTimeOriginal || tags?.DateTimeDigitized || tags?.DateTime;
  if ( !dateTime ) return null;

  const offsetTime
    = tags?.OffsetTimeOriginal || tags?.OffsetTimeDigitized || tags?.OffsetTime;
  const offsetMs = normalizeOffsetToMilliseconds( offsetTime );

  // Expected inputs:
  // - "2018:03:07 08:19:49"
  // - "2018-03-07 08:19:49"
  // - "2018:03:07T08:19:49"
  // - "2018-03-07T08:19:49"
  const match = dateTime.match(
    // eslint-disable-next-line no-useless-escape
    /^(\d{4})[:\-](\d{2})[:\-](\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/,
  );
  if ( !match ) return null;

  const year = Number( match[1] );
  const month = Number( match[2] );
  const day = Number( match[3] );
  const hour = Number( match[4] );
  const minute = Number( match[5] );
  const second = Number( match[6] );

  // If we have an offset, treat the EXIF datetime as a local time at that offset and
  // convert to UTC. Otherwise we treat the EXIF datetime as UTC to match the previous
  // (react-native-exif-reader) behavior.
  const utcMs
    = offsetMs != null
      ? Date.UTC( year, month - 1, day, hour, minute, second ) - offsetMs
      : Date.UTC( year, month - 1, day, hour, minute, second );

  return new Date( utcMs ).toISOString().replace( /Z$/, "" );
};

// https://wbinnssmith.com/blog/subclassing-error-in-modern-javascript/
Object.defineProperty( UsePhotoExifDateFormatError.prototype, "name", {
  value: "UsePhotoExifDateFormatError",
} );

// Parses EXIF date time into a date object
export const parseExifDateToLocalTimezone = ( datetime: string | null ): Date | null => {
  if ( !datetime ) return null;

  // Previously: react-native-exif-reader formats the date based on GMT time,
  // so we create a date object here using GMT time, not the user's local timezone

  // We intentionally interpret EXIF datetime as "GMT/UTC wall time" (not the
  // user's local timezone) and later format as an ISO string without timezone.
  const isoDate = `${datetime}Z`;
  const zonedDate = toZonedTime( isoDate, "GMT" );

  if ( !zonedDate || zonedDate.toString( ).match( /invalid/i ) ) {
    throw new UsePhotoExifDateFormatError( "Date was not formatted correctly" );
  }

  return zonedDate;
};

export const formatExifDateAsString = ( datetime: string | null ): string => {
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

  // TODO: when uri starts with content check if we have required permission
  // Android Read content:// (Android < 10) READ_EXTERNAL_STORAGE
  // Android Read content:// (Android 10+) READ_MEDIA_IMAGES + ACCESS_MEDIA_LOCATION
  const normalizedUris = photoUris.map( uri => ( uri.startsWith( "/" )
    ? `file://${uri}`
    : uri ) );
  const responses = await Promise.allSettled( normalizedUris.map( uri => Exify.read( uri ) ) );

  // If any of the EXIF reads were rejected, log the reasons, but do continue
  const rejectedReasons = responses
    .filter( r => r.status === "rejected" )
    .map( r => r.reason );
  if ( rejectedReasons.length > 0 ) {
    rejectedReasons.forEach(
      reason => logger.error( "Failed to read EXIF data from a photo:", reason ),
    );
  }

  const allExifPhotos = responses
    .filter( r => r.status === "fulfilled" )
    .filter( r => r.value )
    .map( r => r.value );
  allExifPhotos
    .filter( x => x )
    .forEach( currentPhotoExif => {
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
