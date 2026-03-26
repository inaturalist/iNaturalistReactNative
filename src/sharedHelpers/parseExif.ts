import type { ExifTags } from "@lodev09/react-native-exify";
import * as Exify from "@lodev09/react-native-exify";
import { toZonedTime } from "date-fns-tz";
import { formatISONoTimezone } from "sharedHelpers/dateAndTime";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "parseExif.ts" );

class UsePhotoExifDateFormatError extends Error {}
// https://wbinnssmith.com/blog/subclassing-error-in-modern-javascript/
Object.defineProperty( UsePhotoExifDateFormatError.prototype, "name", {
  value: "UsePhotoExifDateFormatError",
} );

// Normalizes EXIF date/time tags to the same string format that
// `parseExifDateToLocalTimezone` historically expects:
//   "YYYY-MM-DDTHH:mm:ss" (no timezone suffix)
const normalizeExifDateToLegacyFormat = ( tags: ExifTags ): string | null => {
  // https://github.com/inaturalist/react-native-exif-reader/blob/f6112fa506a189d4f297316323ef9e1d76d4cedd/ios/ExifReader.swift#L52-L53
  // https://github.com/inaturalist/react-native-exif-reader/blob/f6112fa506a189d4f297316323ef9e1d76d4cedd/android/src/main/java/com/reactnativeexifreader/ExifReaderModule.java#L203-L223
  // "yyyy:MM:dd HH:mm:ss"
  const dateTime = tags?.DateTimeOriginal || tags?.DateTime;
  if ( !dateTime ) return null;

  // TODO: As far as I can see in the exif-reader native code, this was read and used but in the end
  // it was actually stripped as well from the returned date string. So the returned date string was
  // similar to "dateTime" here, only with different delimiter. E.g. a photo from Australia with an
  // exif time of "2026:01:05 18:37:19" and an offset of "+11:00" was returned as
  // "2026-01-05T18:37:19.000".
  // https://github.com/inaturalist/react-native-exif-reader/blob/f6112fa506a189d4f297316323ef9e1d76d4cedd/ios/ExifReader.swift#L23-L31
  // +01:00
  // -07:00
  // const offsetTime
  //   = tags?.OffsetTimeDigitized || tags?.OffsetTime || tags?.OffsetTimeOriginal;

  // Expected inputs:
  // - "2018:03:07 08:19:49"
  const match = dateTime.match(
    /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/,
  );
  if ( !match ) return null;

  const year = Number( match[1] );
  const month = Number( match[2] );
  const day = Number( match[3] );
  const hour = Number( match[4] );
  const minute = Number( match[5] );
  const second = Number( match[6] );

  const utcMs = Date.UTC( year, month - 1, day, hour, minute, second );

  return new Date( utcMs ).toISOString().replace( /Z$/, "" );
};

// Parses EXIF date time into a date object
export const parseExifDateToLocalTimezone = ( datetime: string | null ): Date | null => {
  if ( !datetime ) return null;

  // Previously: react-native-exif-reader formats the date based on GMT time,
  // so we create a date object here using GMT time, not the user's local timezone
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
  const test = formatISONoTimezone( zonedDate );
  console.log( "test", test );
  return test;
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
        const date = normalizeExifDateToLegacyFormat( currentPhotoExif );
        console.log( "date", date );
        unifiedExif.observed_on_string = formatExifDateAsString( date ) || null;
      }
      if ( GPSHPositioningError && !unifiedExif.positional_accuracy ) {
        unifiedExif.positional_accuracy = GPSHPositioningError;
      }
    } );
  return unifiedExif;
};
