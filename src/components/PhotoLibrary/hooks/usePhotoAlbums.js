// @flow

import CameraRoll from "@react-native-community/cameraroll";
import { useEffect, useState } from "react";

const cameraRoll = [{
  label: "camera roll",
  value: "All",
  key: "camera roll"
}];

const usePhotoAlbums = ( ): Array<Object> => {
  const [photoAlbums, setPhotoAlbums] = useState( cameraRoll );

  useEffect( ( ) => {
    let isCurrent = true;

    const fetchAlbums = async ( ) => {
      try {
        const names = cameraRoll;
        const albums = await CameraRoll.getAlbums( { assetType: "Photos" } );

        if ( albums && albums.length > 0 ) { // attempt to fix error on android
          albums.forEach( ( { count, title } ) => {
            if ( count > 0 && title !== "Screenshots" ) { // remove screenshots from gallery
              names.push( { label: title.toLocaleUpperCase( ), value: title, key: title } );
            }
          } );
        }
        if ( !isCurrent ) { return; }
        setPhotoAlbums( names );
      } catch ( e ) {
        console.log( e, "couldn't fetch photo albums" );
      }
    };

    fetchAlbums( );

    return ( ) => {
      isCurrent = false;
    };
  }, [] );

  return photoAlbums;
};

export default usePhotoAlbums;
