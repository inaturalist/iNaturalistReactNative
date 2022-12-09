// @flow

import { parse } from "date-fns";
import { readExif } from "react-native-exif-reader";

class UsePhotoExifDateFormatError extends Error {}

// https://wbinnssmith.com/blog/subclassing-error-in-modern-javascript/
Object.defineProperty( UsePhotoExifDateFormatError.prototype, "name", {
  value: "UsePhotoExifDateFormatError"
} );

// Parses EXIF date time into a date object
export const parseExifDateTime = ( datetime: string ): ?Date => {
  if ( !datetime ) return null;

  // Assume local timezone
  const parsedDate = parse( datetime, "yyyy-MM-dd'T'HH:mm:ss.SSS", new Date() );
  if ( !parsedDate || parsedDate.toString( ).match( /invalid/i ) ) {
    throw new UsePhotoExifDateFormatError( "Date was not formatted correctly" );
  }
  return parsedDate;
};

// Parses EXIF date time into a date object
export const parseExif = async ( photoUri: ?string ): Promise<Object> => {
  try {
    const rawExif = await readExif( photoUri );
    return rawExif;
  } catch ( e ) {
    console.error( e, "Couldn't parse EXIF" );
    return null;
  }
};
