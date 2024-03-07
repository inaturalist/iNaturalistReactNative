// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import { ActivityAnimation, ViewWrapper } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect } from "react";
import { Alert, Platform } from "react-native";
import Observation from "realmModels/Observation";
import { log } from "sharedHelpers/logger";
import useStore from "stores/useStore";

const logger = log.extend( "PhotoSharing" );

const PhotoSharing = ( ): Node => {
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { item } = params;
  const resetStore = useStore( state => state.resetStore );
  const setObservations = useStore( state => state.setObservations );
  const setPhotoImporterState = useStore( state => state.setPhotoImporterState );

  useEffect( ( ) => {
    const { mimeType, data } = item;

    if ( Platform.OS === "android" && !mimeType.startsWith( "image/" ) ) {
      Alert.alert( "Android photo share failed: not an image file" );
      return;
    }

    // Move to ObsEdit screen (new observation, with shared photos).
    logger.info( "calling resetStore" );
    resetStore( );

    const createObservation = async photoUris => {
      try {
        const newObservation = await Observation.createObservationWithPhotos( photoUris );
        setObservations( [newObservation] );
        navigation.navigate( "ObsEdit" );
      } catch ( e ) {
        Alert
          .alert(
            "Photo sharing failed: couldn't create new observation:",
            e
          );
      }
    };

    // Create a new observation with multiple shared photos (one or more)
    let photoUris:any[];

    // data is returned as a string for a single photo on Android
    // and an object with an array of data strings on iOS, i.e.
    // [{"data": "", "", "mimeType": "image/jpeg]
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
      logger.info( "creating observation in useShare with photoUris: ", photoUris );
      createObservation( photoUris );
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
  }, [item, navigation, resetStore, setObservations, setPhotoImporterState] );

  return (
    <ViewWrapper testID="PhotoSharing">
      <View className="flex-1 w-full h-full justify-center items-center">
        <ActivityAnimation />
      </View>
    </ViewWrapper>
  );
};

export default PhotoSharing;
