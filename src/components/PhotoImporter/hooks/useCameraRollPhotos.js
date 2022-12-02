// @flow

import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

const initialStatus = {
  photos: [],
  lastCursor: null,
  lastAlbum: undefined,
  hasNextPage: true,
  fetchingPhotos: false
};

/**
 * Hook that manages access to photos from the operating system.
 * @param {object} options Options passed to @react-native-camera-roll/camera-roll; @see
 *  https://github.com/react-native-cameraroll/react-native-cameraroll#getphotos
 * @param {boolean} isSrolling Whether or not the user is scrolling; generally
 *  we need to fetch more photos when scrolling.
 * @param {boolean} canRequestPhotos Whether or not this hook can fetch photos
 *  now, e.g. if permissions have been granted (Android), or if it's ok to
 *  request permissions (iOS)
 */
const useCameraRollPhotos = (
  options: Object,
  isScrolling: boolean,
  canRequestPhotos: boolean = true
): Object => {
  const [photoFetchStatus, setPhotoFetchStatus] = useState( initialStatus );
  const fetchPhotos = useCallback( async ( ) => {
    const {
      lastCursor, photos, fetchingPhotos, hasNextPage
    } = photoFetchStatus;

    try {
      // keep track of the last photo fetched
      const newOptions = { ...options };

      if ( lastCursor ) {
        newOptions.after = lastCursor;
        if ( Platform.OS === "android" ) {
          // CameraRoll on Android has an open issue for SDK 30+ - so we have to use the
          // `first` param in an undocumented way as a workaround, until an official fix is out:
          // https://github.com/react-native-cameraroll/react-native-cameraroll/issues/359
          newOptions.first = parseInt( lastCursor, 10 ) + options.first;
        }
      }
      // don't fetch more photos in the middle of a fetch
      if ( fetchingPhotos || !hasNextPage ) { return; }

      setPhotoFetchStatus( {
        ...photoFetchStatus,
        fetchingPhotos: true
      } );

      const photosResponse = await CameraRoll.getPhotos( newOptions );
      const newLastCursor = photosResponse.page_info.end_cursor;
      const newHasNextPage = photosResponse.page_info.has_next_page;
      const newPhotos = photosResponse.edges.map( ( { node } ) => node );

      setPhotoFetchStatus( {
        ...photoFetchStatus,
        lastCursor: newLastCursor,
        // On Android, sometimes the response returns photos that we already received in the
        // past - this prevents us from saving those same photos again.
        photos: photos.concat(
          newPhotos.filter( img => !photos.find( x => x.image.uri === img.image.uri ) )
        ),
        hasNextPage: newHasNextPage,
        fetchingPhotos: false
      } );
    } catch ( e ) {
      console.log( e, "couldn't get photos from gallery" );
    }
  }, [photoFetchStatus, options] );

  useEffect( ( ) => {
    // this should happen anytime initial status set, like album change or initial load
    if ( canRequestPhotos && photoFetchStatus.lastCursor === null ) {
      fetchPhotos( );
    }
  }, [canRequestPhotos, photoFetchStatus.lastCursor, fetchPhotos] );

  useEffect( ( ) => {
    // this should happen when onEndReached is called from Photo Gallery screen
    if ( canRequestPhotos && isScrolling ) {
      fetchPhotos( );
    }
  }, [canRequestPhotos, isScrolling, fetchPhotos] );

  useEffect( ( ) => {
    const changedAlbum = ( ) => {
      if ( options.groupName ) {
        return photoFetchStatus.lastAlbum !== options.groupName;
      } if ( !options.groupName && photoFetchStatus.lastAlbum ) {
        // switch back to all photos mode
        return true;
      }
      return false;
    };

    if ( changedAlbum( ) ) {
      // reset photo fetch with new album
      setPhotoFetchStatus( {
        ...initialStatus,
        lastAlbum: options.groupName || undefined
      } );
    }
  }, [photoFetchStatus, options] );

  return photoFetchStatus;
};

export default useCameraRollPhotos;
