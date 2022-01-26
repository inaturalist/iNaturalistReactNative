// @flow

import { useEffect, useState } from "react";
import CameraRoll from "@react-native-community/cameraroll";

const cameraRoll = [{
  label: "camera roll",
  value: "All"
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
          // TODO: change this to map
          albums.forEach( ( { count, title } ) => {
            if ( count > 0 && title !== "Screenshots" ) { // remove screenshots from gallery
              names.push( { label: title.toLocaleUpperCase( ), value: title } );
            }
          } );
        }
        if ( !isCurrent ) { return; }
        setPhotoAlbums( names );
      } catch ( e ) {
        console.log( e, "couldn't fetch photo albums" );
        return;
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


