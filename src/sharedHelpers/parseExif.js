// @flow

import { utcToZonedTime } from "date-fns-tz";
import { readExif, writeExif } from "react-native-exif-reader";
import * as RNLocalize from "react-native-localize";
import { formatISONoTimezone } from "sharedHelpers/dateAndTime";

import { log } from "../../react-native-logs.config";

class UsePhotoExifDateFormatError extends Error {}

// https://wbinnssmith.com/blog/subclassing-error-in-modern-javascript/
Object.defineProperty( UsePhotoExifDateFormatError.prototype, "name", {
  value: "UsePhotoExifDateFormatError"
} );

const logger = log.extend( "parseExif" );

// Parses EXIF date time into a date object
export const parseExifDateToLocalTimezone = ( datetime: string ): ?Date => {
  if ( !datetime ) return null;

  const isoDate = `${datetime}Z`;

  // Use local timezone from device
  const timeZone = RNLocalize.getTimeZone( );
  const zonedDate = utcToZonedTime( isoDate, timeZone );

  if ( !zonedDate || zonedDate.toString( ).match( /invalid/i ) ) {
    throw new UsePhotoExifDateFormatError( "Date was not formatted correctly" );
  }

  return zonedDate;
};

// Parses EXIF date time into a date object
export const parseExif = async ( photoUri: ?string ): Promise<Object> => {
  try {
    return readExif( photoUri );
  } catch ( e ) {
    console.info( e, "Couldn't parse EXIF" );
    return null;
  }
};

interface ExifToWrite {
  latitude?: number;
  longitude?: number;
  positional_accuracy?: number;
}

export const writeExifToFile = async ( photoUri: ?string, exif: ExifToWrite ): Promise<Object> => {
  logger.debug( "writeExifToFile, photoUri: ", photoUri );
  try {
    return writeExif( photoUri, exif );
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
