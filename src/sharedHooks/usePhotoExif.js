// @flow

import { parse } from "date-fns";
import { useEffect, useState } from "react";
import { readExif } from "react-native-exif-reader";

// Parses EXIF date time into a date object
export const parseExifDateTime = ( datetime: string ): ?Date => {
  if ( !datetime ) return null;

  // Assume local timezone
  try {
    return parse( datetime, "yyyy-MM-dd'T'HH:mm:ss.SSS", new Date() );
  } catch ( e ) {
    console.log( `Couldn't parse date ${datetime}`, e.message );
    return null;
  }
};

export const usePhotoExif = ( photoUri: ?string ): Object => {
  const [exif, setExif] = useState( null );

  useEffect( ( ) => {
    let isCurrent = true;

    const parseExif = async ( ): Promise<Object> => {
      try {
        console.log( "EXIF URI", photoUri );
        const rawExif = await readExif( photoUri );
        console.log( "Raw EXIF", rawExif );

        if ( !isCurrent ) { return; }
        setExif( rawExif );
      } catch ( e ) {
        console.log( e, "Couldn't parse EXIF" );
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
