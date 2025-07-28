import { CommonActions, useNavigation, useRoute } from "@react-navigation/native";
import { ActivityAnimation, ViewWrapper } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, {
  useCallback, useEffect, useRef, useState
} from "react";
import { Alert, Platform } from "react-native";
import Observation from "realmModels/Observation";
import { useLayoutPrefs } from "sharedHooks";
import useStore from "stores/useStore";

const PhotoSharing = ( ) => {
  const previousItem = useRef( null );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { item } = params;
  const sharedText = item.extraData?.userInput;
  const resetObservationFlowSlice = useStore( state => state.resetObservationFlowSlice );
  const prepareObsEdit = useStore( state => state.prepareObsEdit );
  const setPhotoImporterState = useStore( state => state.setPhotoImporterState );
  const { screenAfterPhotoEvidence, isDefaultMode } = useLayoutPrefs();
  const [navigationHandled, setNavigationHandled] = useState( null );

  const resetNavigator = useCallback( screen => navigation.dispatch(
    CommonActions.reset( {
      index: 0,
      routes: [
        {
          name: "NoBottomTabStackNavigator",
          state: {
            index: 0,
            routes: [
              {
                name: screen,
                params: { lastScreen: "PhotoSharing" }
              }
            ]
          }
        }
      ]
    } )
  ), [navigation] );

  const createObservationAndNavigate = useCallback( async photoUris => {
    try {
      const newObservation = await Observation.createObservationWithPhotos( photoUris );
      newObservation.description = sharedText;
      prepareObsEdit( newObservation );

      return resetNavigator( isDefaultMode
        ? "Match"
        : screenAfterPhotoEvidence );
    } catch ( e ) {
      Alert.alert(
        "Photo sharing failed: couldn't create new observation:",
        e
      );
      return null;
    }
  }, [sharedText, prepareObsEdit, isDefaultMode, resetNavigator, screenAfterPhotoEvidence] );

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
      resetNavigator( "GroupPhotos" );
    }
  }, [
    createObservationAndNavigate,
    item,
    navigation,
    resetObservationFlowSlice,
    setPhotoImporterState,
    sharedText,
    resetNavigator
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
  useEffect( () => {
    const unsubscribe = navigation.addListener( "focus", () => {
      const isNewShare = item !== previousItem.current;

      // don't navigate backwards if there are new items shared, otherwise
      // we end up back on the home screen without the user ever seeing their shared items
      if ( isNewShare ) {
        setNavigationHandled( false );
        previousItem.current = item;
        return;
      }

      if ( navigationHandled ) {
        navigation.goBack( );
      }
    } );
    return unsubscribe;
  }, [navigation, navigationHandled, item] );

  return (
    <ViewWrapper testID="PhotoSharing">
      <View className="flex-1 w-full h-full justify-center items-center">
        <ActivityAnimation />
      </View>
    </ViewWrapper>
  );
};

export default PhotoSharing;
