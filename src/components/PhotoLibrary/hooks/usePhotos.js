// @flow

import { useEffect, useState } from "react";
import CameraRoll from "@react-native-community/cameraroll";

const usePhotos = ( options: Object, isScrolling: boolean ): Array<Object> => {
  const [photoFetchStatus, setPhotoFetchStatus] = useState( {
    photos: [],
    lastCursor: null,
    stillFetching: false
  } );

  useEffect( ( ) => {
    let isCurrent = true;

    const { lastCursor, photos, stillFetching } = photoFetchStatus;

    const fetchPhotos = async ( ) => {
      try {
        // keep track of the last photo fetched
        if ( lastCursor ) {
          options.after = lastCursor;
        }

        const p = await CameraRoll.getPhotos( options );
        const endCursor = p.page_info.end_cursor;
        const uris = p.edges.map( ( { node } ) => {
          return {
            location: {
              latitude: node.location && node.location.latitude,
              longitude: node.location && node.location.longitude
            },
            timestamp: node.timestamp,
            uri: node.image.uri
          };
        } );
        if ( !isCurrent ) { return; }
        setPhotoFetchStatus( {
          lastCursor: endCursor,
          photos: photos.concat( uris ),
          stillFetching: false
        } );
      } catch ( e ) {
        console.log( e, "couldn't get photos from gallery" );
      }
    };

    if ( !stillFetching && isScrolling ) {
      fetchPhotos( );
    }

    return ( ) => {
      isCurrent = false;
    };
  }, [options, photoFetchStatus, isScrolling] );

  return photoFetchStatus.photos;
};

export default usePhotos;


