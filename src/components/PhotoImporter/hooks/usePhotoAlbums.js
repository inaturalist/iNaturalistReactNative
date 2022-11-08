// @flow

import CameraRoll from "@react-native-community/cameraroll";
import { t } from "i18next";
import { useEffect, useMemo, useState } from "react";

const usePhotoAlbums = ( ): Array<Object> => {
  const cameraRoll = useMemo( ( ) => [{
    label: t( "Camera-Roll" ),
    value: "All",
    key: "camera roll"
  }], [] );

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
              names.push( { label: title, value: title, key: title } );
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
  }, [cameraRoll] );

  return photoAlbums;
};

export default usePhotoAlbums;
