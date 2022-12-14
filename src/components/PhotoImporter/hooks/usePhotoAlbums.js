// @flow

import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { t } from "i18next";
import { useEffect, useMemo, useState } from "react";

const usePhotoAlbums = ( ): ?Array<Object> => {
  const cameraRoll = useMemo( ( ) => [{
    label: t( "Camera-Roll" ),
    value: "All",
    key: "camera roll"
  }], [] );

  const [photoAlbums, setPhotoAlbums] = useState( null );

  useEffect( ( ) => {
    const fetchAlbums = async ( ) => {
      const albumsToDisplay = cameraRoll;

      try {
        const albums = await CameraRoll.getAlbums( { assetType: "Photos" } );

        const filteredAlbums = albums.filter( a => a.title !== "Screenshots" && a.count > 0 );
        filteredAlbums.forEach( ( { title } ) => {
          albumsToDisplay.push( { label: title, value: title, key: title } );
        } );

        setPhotoAlbums( albumsToDisplay );
      } catch ( e ) {
        setPhotoAlbums( albumsToDisplay );
      }
    };

    fetchAlbums( );
  }, [cameraRoll] );

  return photoAlbums;
};

export default usePhotoAlbums;
