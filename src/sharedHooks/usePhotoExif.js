// @flow

import { parse } from "date-fns";
import { useEffect, useState } from "react";
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

export const usePhotoExif = ( photoUri: ?string ): Object => {
  const [exif, setExif] = useState( null );

  useEffect( ( ) => {
    let isCurrent = true;

    const parseExif = async ( ): Promise<Object> => {
      try {
        const rawExif = await readExif( photoUri );

        if ( !isCurrent ) { return; }
        setExif( rawExif );
      } catch ( e ) {
        console.error( e, "Couldn't parse EXIF" );
      }
    };

    if ( photoUri ) {
      parseExif();
    }
    return ( ) => {
      isCurrent = false;
    };
  }, [photoUri] );

  return exif;
};
