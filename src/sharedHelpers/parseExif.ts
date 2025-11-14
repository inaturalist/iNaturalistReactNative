import { toZonedTime } from "date-fns-tz";
import { readExif, writeLocation } from "react-native-exif-reader";
import { formatISONoTimezone } from "sharedHelpers/dateAndTime";

class UsePhotoExifDateFormatError extends Error {}

interface ExifData {
  latitude?: number;
  longitude?: number;
  positional_accuracy?: number;
  date?: string;
}

interface UnifiedExif {
  latitude?: number;
  longitude?: number;
  positional_accuracy?: number;
  observed_on_string?: string | null;
}

// https://wbinnssmith.com/blog/subclassing-error-in-modern-javascript/
Object.defineProperty( UsePhotoExifDateFormatError.prototype, "name", {
  value: "UsePhotoExifDateFormatError"
} );

// Parses EXIF date time into a date object
export const parseExifDateToLocalTimezone = ( datetime?: string ): Date | null => {
  if ( !datetime ) return null;

  // react-native-exif-reader formats the date based on GMT time,
  // so we create a date object here using GMT time, not the user's local timezone
  const isoDate = `${datetime}Z`;
  const zonedDate = toZonedTime( isoDate, "GMT" );

  if ( !zonedDate || zonedDate.toString( ).match( /invalid/i ) ) {
    throw new UsePhotoExifDateFormatError( "Date was not formatted correctly" );
  }

  return zonedDate;
};

// Parses EXIF date time into a date object
export const parseExif = async ( photoUri: string ): Promise<ExifData | null> => {
  try {
    return readExif( photoUri );
  } catch ( e ) {
    console.error( e, "Couldn't parse EXIF" );
    return null;
  }
};

// TODO: Johannes: I think this interface should be
// exported from the react-native-exif-reader library
export interface ExifToWrite {
  latitude?: number | null;
  longitude?: number | null;
  positional_accuracy?: number | null;
}

export const writeExifToFile = async (
  photoUri: string,
  exif: ExifToWrite
): Promise<object | null> => {
  try {
    return writeLocation( photoUri, exif );
  } catch ( e ) {
    console.error( e, "Couldn't write EXIF" );
    return null;
  }
};

export const formatExifDateAsString = ( datetime?: string ): string => {
  const zonedDate = parseExifDateToLocalTimezone( datetime );
  // this returns a string, in the same format as photos which fall back to the
  // photo timestamp instead of exif data
  return formatISONoTimezone( zonedDate );
};

// Parse the EXIF of all photos - fill out details (lat/lng/date) from all of these,
// in case the first photo is missing EXIF
export const readExifFromMultiplePhotos = async (
  photoUris: Array<string>
): Promise<UnifiedExif> => {
  const unifiedExif: UnifiedExif = {};

  const responses = await Promise.allSettled( photoUris.map( parseExif ) );
  const allExifPhotos = responses
    .map( r => ( r.status === "fulfilled"
      ? r.value
      : null ) );

  allExifPhotos.forEach(
    currentPhotoExif => {
      if ( !currentPhotoExif ) return;
      const {
        latitude, longitude, positional_accuracy: positionalAccuracy, date
      } = currentPhotoExif;

      if ( !unifiedExif.latitude ) {
        unifiedExif.latitude = latitude;
      }
      if ( !unifiedExif.longitude ) {
        unifiedExif.longitude = longitude;
      }
      if ( !unifiedExif.observed_on_string ) {
        unifiedExif.observed_on_string = formatExifDateAsString( date ) || null;
      }
      if ( positionalAccuracy && !unifiedExif.positional_accuracy ) {
        unifiedExif.positional_accuracy = positionalAccuracy;
      }
    }
  );
  return unifiedExif;
};
