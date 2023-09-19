// @flow

import { useNavigation } from "@react-navigation/native";
import { ObsEditContext } from "providers/contexts";
import { useCallback, useContext, useEffect } from "react";
import { Platform } from "react-native";
import ShareMenu from "react-native-share-menu";

import { log } from "../../react-native-logs.config";

type SharedItem = {
  mimeType: string,
  data: any | any[],
  extraData: any,
};

const logger = log.extend( "useShare" );

const useShare = ( ): void => {
  const navigation = useNavigation( );
  const obsEditContext = useContext( ObsEditContext );
  const {
    createObservationsFromGroupedPhotos
  } = useContext( ObsEditContext );

  const handleShare = useCallback( ( item: ?SharedItem ) => {
    if ( !item ) {
      logger.info( "no item" );
      return;
    }

    const { mimeType, data } = item;

    if ( ( !data )
      || (
        ( Platform.OS === "android" )
        && ( ( !mimeType ) || ( !mimeType.startsWith( "image/" ) ) )
      )
    ) {
      logger.info( "no data or not an image" );
      return;
    }

    // Move to ObsEdit screen (new observation, with shared photos).

    const resetObsEditContext = obsEditContext?.resetObsEditContext;

    // Clear previous upload context before navigating
    if ( resetObsEditContext ) {
      logger.info( "calling resetObsEditContext" );
      resetObsEditContext( );
    }

    // Create a new observation with multiple shared photos (one or more)

    let photoUris:any[];

    if ( Array.isArray( data ) ) {
      photoUris = data;
    } else {
      photoUris = [data];
    }

    logger.info( "photoUris: ", photoUris );

    if ( Platform.OS === "android" ) {
      photoUris = photoUris.map( x => ( { image: { uri: x } } ) );
    } else {
      photoUris = photoUris
        .filter( x => x.mimeType && x.mimeType.startsWith( "image/" ) )
        .map( x => ( { image: { uri: x.data } } ) );
    }
    logger.info( "calling createObservationsFromGroupedPhotos with photoUris: ", photoUris );
    createObservationsFromGroupedPhotos( [{ photos: photoUris }] );

    navigation.navigate( "ObsEdit" );
  }, [createObservationsFromGroupedPhotos, navigation, obsEditContext?.resetObsEditContext] );

  useEffect( () => {
    ShareMenu.getInitialShare( handleShare );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [] );

  useEffect( () => {
    const listener = ShareMenu.addNewShareListener( handleShare );

    return () => {
      listener?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [] );
};

export default useShare;
