import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import {
  photoLibraryPhotosPath
} from "appConstants/paths.ts";
import navigateToObsDetails from "components/ObsDetails/helpers/navigateToObsDetails";
import { ActivityAnimation, ViewWrapper } from "components/SharedComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, {
  useCallback,
  useState
} from "react";
import {
  InteractionManager,
  Platform,
  View
} from "react-native";
import RNFS from "react-native-fs";
import * as ImagePicker from "react-native-image-picker";
import Observation from "realmModels/Observation";
import ObservationPhoto from "realmModels/ObservationPhoto";
import fetchPlaceName from "sharedHelpers/fetchPlaceName";
import { sleep } from "sharedHelpers/util.ts";
import { useLayoutPrefs } from "sharedHooks";
import useExitObservationsFlow from "sharedHooks/useExitObservationFlow.ts";
import useStore from "stores/useStore";

const MAX_PHOTOS_ALLOWED = 20;
const DEFAULT_MODE_MAX_PHOTOS_ALLOWED = 1;

const PhotoLibrary = ( ): Node => {
  const {
    isDefaultMode
  } = useLayoutPrefs( );
  const navigation = useNavigation( );
  const [photoLibraryShown, setPhotoLibraryShown] = useState( false );
  const setPhotoImporterState = useStore( state => state.setPhotoImporterState );
  const setGroupedPhotos = useStore( state => state.setGroupedPhotos );
  const groupedPhotos = useStore( state => state.groupedPhotos );
  const updateObservations = useStore( state => state.updateObservations );
  const photoLibraryUris = useStore( state => state.photoLibraryUris );
  const evidenceToAdd = useStore( state => state.evidenceToAdd );
  const currentObservation = useStore( state => state.currentObservation );
  const currentObservationIndex = useStore( state => state.currentObservationIndex );
  const observations = useStore( state => state.observations );
  const numOfObsPhotos = currentObservation?.observationPhotos?.length || 0;
  const isSuggestionsFlowMode = useStore( state => state.layout.isSuggestionsFlowMode );
  const exitObservationsFlow = useExitObservationsFlow( );

  const { params } = useRoute( );
  const skipGroupPhotos = params
    ? params.skipGroupPhotos
    : false;
  const fromGroupPhotos = params
    ? params.fromGroupPhotos
    : false;
  const lastScreen = params?.lastScreen;

  const navToObsEdit = useCallback( ( ) => navigation.navigate( "ObsEdit", {
    lastScreen: "PhotoLibrary"
  } ), [navigation] );

  const advanceToMatchScreen = lastScreen === "Camera"
    && isDefaultMode;

  const navToNextScreen = useCallback( async ( ) => {
    if ( advanceToMatchScreen ) {
      return navigation.navigate( "Match", {
        lastScreen: "PhotoLibrary"
      } );
    }
    if ( isSuggestionsFlowMode ) {
      return navigation.navigate( "Suggestions", {
        lastScreen: "PhotoLibrary"
      } );
    }
    return navigation.navigate( "ObsEdit", {
      lastScreen: "PhotoLibrary"
    } );
  }, [navigation, advanceToMatchScreen, isSuggestionsFlowMode] );

  const moveImagesToDocumentsDirectory = async selectedImages => {
    const path = photoLibraryPhotosPath;
    await RNFS.mkdir( path );

    const movedImages = await Promise.all( selectedImages.map( async ( { image } ) => {
      const { fileName } = image;
      const destPath = `${path}/${fileName}`;
      const sourcePath = `${RNFS.TemporaryDirectoryPath}/${fileName}`;
      await RNFS.moveFile( sourcePath, destPath );
      return {
        image: {
          ...image,
          uri: Platform.OS === "ios"
            ? `file://${destPath}`
            : destPath
        }
      };
    } ) );
    return movedImages;
  };

  const showPhotoLibrary = React.useCallback( async () => {
    if ( photoLibraryShown ) {
      return;
    }

    setPhotoLibraryShown( true );

    if ( Platform.OS === "ios" ) {
      // iOS has annoying transition of the screen - that if we don't wait enough time,
      // the launchImageLibrary would halt and not return (and not showing any image picker)
      await sleep( 500 );
    }

    // According to the native code of the image picker library, it never rejects the promise,
    // just returns a response object with errorCode
    const response = await ImagePicker.launchImageLibrary( {
      selectionLimit: advanceToMatchScreen
        ? DEFAULT_MODE_MAX_PHOTOS_ALLOWED
        : MAX_PHOTOS_ALLOWED,
      mediaType: "photo",
      includeBase64: false,
      forceOldAndroidPhotoPicker: true,
      chooserTitle: t( "Import-Photos-From" ),
      presentationStyle: "overFullScreen"
    } );

    if ( !response || response.didCancel || !response.assets || response.errorCode ) {
      // User cancelled selection of photos - close current screen

      if ( fromGroupPhotos ) {
        // This screen was called from the plus button of the group photos screen - get back to it
        navigation.navigate( "NoBottomTabStackNavigator", { screen: "GroupPhotos" } );
        navigation.setParams( { fromGroupPhotos: false } );
      } else if ( skipGroupPhotos ) {
        // This only happens when being called from ObsEdit
        navToObsEdit();

        // Determine if we need to go back to ObsList or ObsDetails screen
      } else if ( params && params.previousScreen && params.previousScreen.name === "ObsDetails" ) {
        navigateToObsDetails( navigation, params.previousScreen.params.uuid );
      } else if ( params?.cmonBack && navigation.canGoBack() ) {
        navigation.goBack();
      } else {
        exitObservationsFlow();
      }
      setPhotoLibraryShown( false );
      return;
    }

    const selectedTmpDirectoryImages = response.assets.map( x => ( { image: x } ) );
    const selectedImages = await moveImagesToDocumentsDirectory( selectedTmpDirectoryImages );

    if ( fromGroupPhotos ) {
      // This screen was called from the plus button of the group photos screen - get back to it
      // after adding the newly selected photos
      setGroupedPhotos( [...groupedPhotos, ...selectedImages.map( photo => ( {
        photos: [photo]
      } ) )] );
      navigation.setParams( { fromGroupPhotos: false } );
      navigation.navigate( "NoBottomTabStackNavigator", { screen: "GroupPhotos" } );
      setPhotoLibraryShown( false );
      return;
    }

    const importedPhotoUris = selectedImages.map( x => x.uri );

    if ( skipGroupPhotos ) {
      // add evidence to existing observation
      setPhotoImporterState( {
        photoLibraryUris: [...photoLibraryUris, ...importedPhotoUris],
        evidenceToAdd: [...evidenceToAdd, ...importedPhotoUris]
      } );
      const obsPhotos = await ObservationPhoto
        .createObsPhotosWithPosition( selectedImages, { position: numOfObsPhotos } );

      // If the current observation is not synced, update the EXIF data from imported photos
      const unsynced = !currentObservation?._synced_at;
      let updatedCurrentObservation = unsynced
        ? await Observation
          .updateObsExifFromPhotos( importedPhotoUris, currentObservation )
        : currentObservation;

      updatedCurrentObservation = Observation
        .appendObsPhotos( obsPhotos, updatedCurrentObservation );
      observations[currentObservationIndex] = updatedCurrentObservation;
      updateObservations( observations );
      navToObsEdit();
      setPhotoLibraryShown( false );
    } else if ( selectedImages.length === 1 ) {
      // create a new observation and skip group photos screen
      const newObservation = await Observation.createObservationWithPhotos( [selectedImages[0]] );
      // fetch place name to display on Match screen
      if ( newObservation.latitude ) {
        const placeName = await fetchPlaceName(
          newObservation.latitude,
          newObservation.longitude
        );
        newObservation.place_guess = placeName;
      }
      setPhotoImporterState( {
        observations: [newObservation]
      } );
      navToNextScreen( );
      setPhotoLibraryShown( false );
    } else {
      // navigate to group photos
      setPhotoImporterState( {
        photoLibraryUris: [...photoLibraryUris, ...importedPhotoUris],
        groupedPhotos: selectedImages.map( photo => ( {
          photos: [photo]
        } ) )
      } );
      navigation.setParams( { fromGroupPhotos: false } );
      navigation.navigate( "NoBottomTabStackNavigator", { screen: "GroupPhotos" } );
      setPhotoLibraryShown( false );
    }
  }, [
    advanceToMatchScreen,
    currentObservation,
    currentObservationIndex,
    evidenceToAdd,
    exitObservationsFlow,
    fromGroupPhotos,
    photoLibraryUris,
    groupedPhotos,
    navigation,
    navToObsEdit,
    navToNextScreen,
    numOfObsPhotos,
    observations,
    params,
    photoLibraryShown,
    setGroupedPhotos,
    setPhotoImporterState,
    skipGroupPhotos,
    updateObservations
  ] );

  useFocusEffect(
    React.useCallback( () => {
      // This will run when the screen comes into focus.
      let interactionHandle = null;

      // Wait for screen to finish transition
      interactionHandle = InteractionManager.runAfterInteractions( () => {
        if ( !photoLibraryShown ) {
          showPhotoLibrary();
        }
      } );

      return () => {
        // This runs when the screen goes out of focus
        if ( interactionHandle ) {
          interactionHandle.cancel();
        }
      };
    }, [photoLibraryShown, showPhotoLibrary] )
  );

  return (
    <ViewWrapper testID="PhotoLibrary">
      <View className="flex-1 w-full h-full justify-center items-center">
        <ActivityAnimation />
      </View>
    </ViewWrapper>
  );
};

export default PhotoLibrary;
