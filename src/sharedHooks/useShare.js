// @flow

import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect } from "react";
import { Platform } from "react-native";
import ShareMenu from "react-native-share-menu";
import Observation from "realmModels/Observation";
import useStore from "stores/useStore";

import { log } from "../../react-native-logs.config";

type SharedItem = {
  mimeType: string,
  data: any | any[],
  extraData: any,
};

const logger = log.extend( "useShare" );

const useShare = ( ): void => {
  const navigation = useNavigation( );
  const resetStore = useStore( state => state.resetStore );
  const setObservations = useStore( state => state.setObservations );
  const setPhotoImporterState = useStore( state => state.setPhotoImporterState );

  const handleShare = useCallback( async ( item: ?SharedItem ) => {
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
    logger.info( "calling resetStore" );
    resetStore( );

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

    if ( photoUris.length === 1 ) {
      // Only one photo - go to ObsEdit directly
      logger.info( "creating observations in useShare with photoUris: ", photoUris );
      const newObservations = await Promise.all( [{ photos: photoUris }].map(
        ( { photos } ) => Observation.createObservationWithPhotos( photos )
      ) );
      setObservations( newObservations );

      navigation.navigate( "ObsEdit" );
    } else {
      // Go to GroupPhotos screen
      setPhotoImporterState( {
        galleryUris: photoUris.map( x => x.image.uri ),
        groupedPhotos: photoUris.map( photo => ( {
          photos: [photo]
        } ) )
      } );
      navigation.navigate( "CameraNavigator", { screen: "GroupPhotos" } );
    }
  }, [resetStore, setObservations, navigation, setPhotoImporterState] );

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
