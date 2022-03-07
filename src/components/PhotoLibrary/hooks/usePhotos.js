// @flow

import { useEffect, useState } from "react";
import CameraRoll from "@react-native-community/cameraroll";
import uuid from "react-native-uuid";
import { formatDateAndTime } from "../../../sharedHelpers/dateAndTime";

const initialStatus = {
  photos: [],
  lastCursor: null,
  lastAlbum: undefined,
  hasNextPage: true
};

const usePhotos = ( options: Object, isScrolling: boolean ): Array<Object> => {
  const [photoFetchStatus, setPhotoFetchStatus] = useState( initialStatus );

  useEffect( ( ) => {
    let isCurrent = true;
    const { lastCursor, photos, hasNextPage } = photoFetchStatus;

    const changedAlbum = ( ) => {
      if ( options.groupName ) {
        return photoFetchStatus.lastAlbum !== options.groupName;
      } else if ( !options.groupName && photoFetchStatus.lastAlbum ) {
        // switch back to all photos mode
        return true;
      }
      return false;
    };

    const fetchPhotos = async ( ) => {
      try {
        // keep track of the last photo fetched
        if ( lastCursor ) {
          options.after = lastCursor;
        }

        const p = await CameraRoll.getPhotos( options );
        const endCursor = p.page_info.end_cursor;
        const nextPage = p.page_info.has_next_page;
        const uris = p.edges.map( ( { node } ) => {
          return {
            latitude: node.location && node.location.latitude,
            longitude: node.location && node.location.longitude,
            observed_on_string: formatDateAndTime( node.timestamp ),
            timestamp: node.timestamp,
            uri: node.image.uri,
            // adding a uuid here makes it easier to prevent duplicates in uploader
            uuid: uuid.v4( )
          };
        } );

        if ( !isCurrent ) { return; }
        setPhotoFetchStatus( {
          ...photoFetchStatus,
          lastCursor: endCursor,
          photos: photos.concat( uris ),
          stillFetching: false,
          hasNextPage: nextPage
        } );
      } catch ( e ) {
        console.log( e, "couldn't get photos from gallery" );
      }
    };

    if ( changedAlbum( ) ) {
      // reset photo fetch with new album
      setPhotoFetchStatus( {
        ...initialStatus,
        lastAlbum: options.groupName || undefined
      } );
    }

    if ( !hasNextPage ) { return; }

    if ( isScrolling ) {
      fetchPhotos( );
    }
    return ( ) => {
      isCurrent = false;
    };
  }, [photoFetchStatus, options, isScrolling] );

  return photoFetchStatus.photos;
};

export default usePhotos;


