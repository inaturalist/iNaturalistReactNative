import type { ExifTags } from "@lodev09/react-native-exify";
import * as Exify from "@lodev09/react-native-exify";
import { toZonedTime } from "date-fns-tz";
import { formatISONoTimezone } from "sharedHelpers/dateAndTime";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "parseExif.ts" );

class UsePhotoExifDateFormatError extends Error {}

const pad2 = ( n: number ) => String( n ).padStart( 2, "0" );

/**
 * Milliseconds for `yyyy-MM-dd'T'HH:mm:ss.SSS` (Swift `DateFormatter` `.SSS`).
 * iOS exif-reader parsed `DateTimeOriginal` without subseconds; `.SSS` is usually `.000`.
 * If the EXIF string includes a fractional part, we honor it.
 */
const tripleFromFractionalSeconds = ( fractional?: string ): string => {
  if ( !fractional ) return "000";
  const digits = fractional.replace( /\D/g, "" );
  if ( !digits ) return "000";
  return digits.padEnd( 3, "0" ).slice( 0, 3 );
};

/**
 * Matches iOS `react-native-exif-reader` **`response["date"]`** string:
 * - **Only** `DateTimeOriginal` (not Digitized / DateTime fallbacks).
 * - `yyyy-MM-dd'T'HH:mm:ss.SSS` from the EXIF civil clock (Swift parses in the photo
 *   offset zone then formats; digits match `DateTimeOriginal` for typical tags).
 */
export const observedOnStringFromExifTags = ( tags: ExifTags ): string | null => {
  const dateTimeOriginal = tags.DateTimeOriginal;
  if ( !dateTimeOriginal ) return null;

  const match = dateTimeOriginal.match(
    // eslint-disable-next-line no-useless-escape
    /^(\d{4})[:\-](\d{2})[:\-](\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/,
  );
  if ( !match ) return null;

  const y = Number( match[1] );
  const mo = Number( match[2] );
  const d = Number( match[3] );
  const h = Number( match[4] );
  const mi = Number( match[5] );
  const s = Number( match[6] );
  const subSec = tripleFromFractionalSeconds( match[7] );

  return `${y}-${pad2( mo )}-${pad2( d )}T${pad2( h )}:${pad2( mi )}:${pad2( s )}.${subSec}`;
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

  // TODO: when uri starts with content do we need to check if we have required permission
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
        GPSLatitudeRef,
        GPSLongitude,
        GPSLongitudeRef,
        GPSHPositioningError,
      } = currentPhotoExif;

      if ( !unifiedExif.latitude && GPSLatitude ) {
        unifiedExif.latitude
          = GPSLatitudeRef === "S"
            ? -GPSLatitude
            : GPSLatitude;
      }
      if ( !unifiedExif.longitude && GPSLongitude ) {
        unifiedExif.longitude = GPSLongitudeRef === "W"
          ? -GPSLongitude
          : GPSLongitude;
      }
      if ( !unifiedExif.observed_on_string ) {
        unifiedExif.observed_on_string = observedOnStringFromExifTags( currentPhotoExif ) ?? null;
      }
      if ( GPSHPositioningError && !unifiedExif.positional_accuracy ) {
        unifiedExif.positional_accuracy = GPSHPositioningError;
      }
    } );
  return unifiedExif;
};
