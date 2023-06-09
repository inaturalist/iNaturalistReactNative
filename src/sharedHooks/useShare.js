// @flow

import { useNavigation } from "@react-navigation/native";
import { ObsEditContext } from "providers/contexts";
import { useCallback, useContext, useEffect } from "react";
import { Platform } from "react-native";
import ShareMenu from "react-native-share-menu";

type SharedItem = {
  mimeType: string,
  data: any | any[],
  extraData: any,
};

const useShare = ( ): void => {
  const navigation = useNavigation( );
  const obsEditContext = useContext( ObsEditContext );
  const {
    createObservationsFromGroupedPhotos
  } = useContext( ObsEditContext );

  const handleShare = useCallback( ( item: ?SharedItem ) => {
    if ( !item ) {
      return;
    }

    const { mimeType, data } = item;

    if ( ( !data )
      || (
        ( Platform.OS === "android" )
        && ( ( !mimeType ) || ( !mimeType.startsWith( "image/" ) ) )
      )
    ) {
      return;
    }

    // Move to ObsEdit screen (new observation, with shared photos).

    const resetObsEditContext = obsEditContext?.resetObsEditContext;

    // Clear previous upload context before navigating
    if ( resetObsEditContext ) {
      resetObsEditContext( );
    }

    // Create a new observation with multiple shared photos (one or more)

    let photoUris:any[];

    if ( Array.isArray( data ) ) {
      photoUris = data;
    } else {
      photoUris = [data];
    }

    if ( Platform.OS === "android" ) {
      photoUris = photoUris.map( x => ( { image: { uri: x } } ) );
    } else {
      photoUris = photoUris
        .filter( x => x.mimeType && x.mimeType.startsWith( "image/" ) )
        .map( x => ( { image: { uri: x.data } } ) );
    }
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
      listener.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [] );
};

export default useShare;
