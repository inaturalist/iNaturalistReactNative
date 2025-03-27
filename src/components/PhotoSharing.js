// @flow

import { CommonActions, useNavigation, useRoute } from "@react-navigation/native";
import { ActivityAnimation, ViewWrapper } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import Observation from "realmModels/Observation";
import { useLayoutPrefs } from "sharedHooks";
import useStore from "stores/useStore";

const PhotoSharing = ( ): Node => {
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { item } = params;
  const sharedText = item.extraData?.userInput;
  const resetObservationFlowSlice = useStore( state => state.resetObservationFlowSlice );
  const prepareObsEdit = useStore( state => state.prepareObsEdit );
  const setPhotoImporterState = useStore( state => state.setPhotoImporterState );
  const { screenAfterPhotoEvidence, isDefaultMode } = useLayoutPrefs();
  const [navigationHandled, setNavigationHandled] = useState( null );

  const createObservationAndNavigate = useCallback( async photoUris => {
    try {
      const newObservation = await Observation.createObservationWithPhotos( photoUris );
      newObservation.description = sharedText;
      prepareObsEdit( newObservation );

      if ( isDefaultMode ) {
        return navigation.dispatch(
          CommonActions.reset( {
            index: 0,
            routes: [
              {
                name: "NoBottomTabStackNavigator",
                state: {
                  index: 0,
                  routes: [
                    {
                      name: "Match",
                      params: { lastScreen: "PhotoSharing" }
                    }
                  ]
                }
              }
            ]
          } )
        );
      }

      // in advanced mode, navigate based on user preference

      return navigation.dispatch(
        CommonActions.reset( {
          index: 0,
          routes: [
            {
              name: "NoBottomTabStackNavigator",
              state: {
                index: 0,
                routes: [
                  {
                    name: screenAfterPhotoEvidence,
                    params: { lastScreen: "PhotoSharing" }
                  }
                ]
              }
            }
          ]
        } )
      );
    } catch ( e ) {
      Alert.alert(
        "Photo sharing failed: couldn't create new observation:",
        e
      );
      return null;
    }
  }, [sharedText, prepareObsEdit, isDefaultMode, navigation, screenAfterPhotoEvidence] );

  useEffect( ( ) => {
    const { mimeType, data } = item;

    if ( Platform.OS === "android" && !mimeType.startsWith( "image/" ) ) {
      Alert.alert( "Android photo share failed: not an image file" );
      return;
    }

    // when sharing, we need to reset zustand like we do while
    // navigating through the AddObsModal
    resetObservationFlowSlice( );

    // Create a new observation with multiple shared photos (one or more)
    let photoUris;

    // data is returned as a string for a single photo on Android
    // and an object with an array of data strings on iOS, i.e.
    // [{"data": "", "", "mimeType": "image/jpeg]
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

    if ( photoUris.length === 1 ) {
      createObservationAndNavigate( photoUris );
    } else {
      // Go to GroupPhotos screen
      const firstObservationDefaults = { description: sharedText };
      setPhotoImporterState( {
        photoLibraryUris: photoUris.map( x => x.image.uri ),
        groupedPhotos: photoUris.map( photo => ( {
          photos: [photo]
        } ) ),
        firstObservationDefaults
      } );
      navigation.navigate( "NoBottomTabStackNavigator", { screen: "GroupPhotos" } );
    }
  }, [
    createObservationAndNavigate,
    item,
    navigation,
    resetObservationFlowSlice,
    setPhotoImporterState,
    sharedText
  ] );

  // When the user leaves this screen, we record the fact that navigation was handled...
  useEffect( ( ) => {
    const unsubscribe = navigation.addListener( "blur", ( ) => {
      setNavigationHandled( true );
    } );
    return unsubscribe;
  }, [navigation] );
  // ...and if they focus on this screen again, that means they backed out of
  // obs edit and need to back to the previous screen in the nav
  useEffect( ( ) => {
    const unsubscribe = navigation.addListener( "focus", ( ) => {
      if ( navigationHandled ) navigation.goBack( );
    } );
    return unsubscribe;
  }, [
    navigation,
    navigationHandled
  ] );

  return (
    <ViewWrapper testID="PhotoSharing">
      <View className="flex-1 w-full h-full justify-center items-center">
        <ActivityAnimation />
      </View>
    </ViewWrapper>
  );
};

export default PhotoSharing;
