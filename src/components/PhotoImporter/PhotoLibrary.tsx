import { mkdir, moveFile, TemporaryDirectoryPath } from "@dr.pogodin/react-native-fs";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import {
  photoLibraryPhotosPath,
} from "appConstants/paths";
import navigateToObsDetails from "components/ObsDetails/helpers/navigateToObsDetails";
import { ActivityAnimation, ViewWrapper } from "components/SharedComponents";
import { t } from "i18next";
import type { NoBottomTabStackScreenProps } from "navigation/types";
import React, {
  useCallback,
  useState,
} from "react";
import {
  InteractionManager,
  Platform,
  View,
} from "react-native";
import type { Asset } from "react-native-image-picker";
import { launchImageLibrary } from "react-native-image-picker";
import Observation from "realmModels/Observation";
import ObservationPhoto from "realmModels/ObservationPhoto";
import fetchPlaceName from "sharedHelpers/fetchPlaceName";
import { log } from "sharedHelpers/logger";
import { sleep } from "sharedHelpers/util";
import { useLayoutPrefs } from "sharedHooks";
import useExitObservationFlow from "sharedHooks/useExitObservationFlow";
import useStore from "stores/useStore";

const logger = log.extend( "PhotoLibrary" );

const MAX_PHOTOS_ALLOWED = Platform.select( {
  ios: 500,
  android: 100,
} );

const FROM_AICAMERA_MAX_PHOTOS_ALLOWED = 1;

const PhotoLibrary = ( ) => {
  const {
    screenAfterPhotoEvidence, isDefaultMode,
  } = useLayoutPrefs( );
  const navigation = useNavigation<NoBottomTabStackScreenProps<"PhotoLibrary">["navigation"]>();
  const { params } = useRoute<NoBottomTabStackScreenProps<"PhotoLibrary">["route"]>();

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
  const numOfObsPhotos: number = currentObservation?.observationPhotos?.length || 0;
  const exitObservationFlow = useExitObservationFlow( );

  const skipGroupPhotos = params
    ? params.skipGroupPhotos
    : false;
  const fromGroupPhotos = params
    ? params.fromGroupPhotos
    : false;
  const fromAICamera = params
    ? params.fromAICamera
    : false;

  const navToObsEdit = useCallback( ( ) => navigation.navigate( "ObsEdit", {
    lastScreen: "PhotoLibrary",
  } ), [navigation] );

  const navBasedOnUserSettings = useCallback( async ( ) => {
    if ( isDefaultMode ) {
      // TODO: why do we need to define higher navigator here
      return navigation.navigate( "NoBottomTabStackNavigator", {
        screen: "Match",
        params: {
          lastScreen: "PhotoLibrary",
        },
      } );
    }

    // in advanced mode, navigate based on user preference
    return navigation.navigate( "NoBottomTabStackNavigator", {
      screen: screenAfterPhotoEvidence,
      params: {
        lastScreen: "PhotoLibrary",
      },
    } );
  }, [navigation, screenAfterPhotoEvidence, isDefaultMode] );

  const moveImagesToDocumentsDirectory = async ( selectedImages:
    { image: Asset }[] ) => {
    const path = photoLibraryPhotosPath;
    await mkdir( path );

    const movedImages = await Promise.all( selectedImages.map( async ( { image } ) => {
      const { fileName, uri } = image;
      if ( !fileName ) {
        throw new Error( "No fileName in pick photo response" );
      }
      const destPath = `${path}/${fileName}`;
      const getSourcePath = Platform.select( {
        ios: ( ) => `${TemporaryDirectoryPath}/${fileName}`,
        // Get image from uri on android. TemporaryDirectoryPath results in an ANR.
        android: ( ) => {
          if ( !uri ) {
            throw new Error( "No URI in pick photo response" );
          }
          return uri;
        },
        default: ( ) => {
          throw new Error( `Unsupported platform for moving picked photo: ${Platform.OS}` );
        },
      } );

      await moveFile( getSourcePath(), destPath );
      return {
        image: {
          ...image,
          uri: Platform.OS === "ios"
            ? `file://${destPath}`
            : destPath,
        },
      };
    } ) );
    return movedImages;
  };

  const showPhotoLibrary = useCallback( async () => {
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
    // https://github.com/react-native-image-picker/react-native-image-picker?tab=readme-ov-file#Asset-Object
    // THAT SAID, we had an android isse where this threw an error, causing a stuck loading screen
    // see https://linear.app/inaturalist/issue/MOB-90/importing-photo-while-offline-in-android-gets-stuck-on-photogallery
    // so I am adding a try/catch just in case
    let response;
    try {
      response = await launchImageLibrary( {
        selectionLimit: fromAICamera
          ? FROM_AICAMERA_MAX_PHOTOS_ALLOWED
          : MAX_PHOTOS_ALLOWED,
        mediaType: "photo",
        includeBase64: false,
        // forceOldAndroidPhotoPicker is necessary because the "new" picker strips key EXIF data
        forceOldAndroidPhotoPicker: true,
        chooserTitle: t( "Import-Photos-From" ),
        presentationStyle: "overFullScreen",
      } );
    } catch ( launchError ) {
      logger.error( "launchImageLibrary threw unexpectedly", launchError );
      setPhotoLibraryShown( false );
      exitObservationFlow( );
      return;
    }

    if ( !response || response.didCancel || !response.assets || response.errorCode ) {
      // User cancelled selection of photos - close current screen
      if ( response?.errorCode ) {
        logger.error(
          `import from photo library error: ${response.errorCode}: ${response.errorMessage}`,
        );
      }

      if ( fromGroupPhotos ) {
        // This screen was called from the plus button of the group photos screen - get back to it
        navigation.navigate( "NoBottomTabStackNavigator", { screen: "GroupPhotos" } );
        navigation.setParams( { fromGroupPhotos: false } );
      } else if ( skipGroupPhotos ) {
        // This only happens when being called from ObsEdit
        navToObsEdit();

        // Determine if we need to go back to ObsList or ObsDetails screen
      } else if ( params && params.previousScreen && params.previousScreen.name === "ObsDetails" ) {
        // If the uuid is undefined we need to error out here or ObsDetails doesn't work
        if ( !params.previousScreen.params?.uuid ) {
          throw new Error( "No UUID found to route to ObsDetails screen" );
        }
        navigateToObsDetails( navigation, params.previousScreen.params.uuid );
      } else if ( params?.cmonBack && navigation.canGoBack() ) {
        navigation.goBack();
      } else {
        exitObservationFlow( );
      }
      setPhotoLibraryShown( false );
      return;
    }

    try {
      const selectedTmpDirectoryImages = response.assets.map( x => ( { image: x } ) );
      const selectedImages = await moveImagesToDocumentsDirectory( selectedTmpDirectoryImages );

      if ( fromGroupPhotos ) {
        // This screen was called from the plus button of the group photos screen - get back to it
        // after adding the newly selected photos
        setGroupedPhotos( [...groupedPhotos, ...selectedImages.map( photo => ( {
          photos: [photo],
        } ) )] );
        navigation.setParams( { fromGroupPhotos: false } );
        navigation.navigate( "NoBottomTabStackNavigator", { screen: "GroupPhotos" } );
        setPhotoLibraryShown( false );
        return;
      }

      const importedPhotoUris = selectedImages.map( x => x.image.uri );

      if ( skipGroupPhotos ) {
        // add evidence to existing observation
        setPhotoImporterState( {
          photoLibraryUris: [...photoLibraryUris, ...importedPhotoUris],
          evidenceToAdd: [...evidenceToAdd, ...importedPhotoUris],
        } );
        const obsPhotos = await ObservationPhoto
          .createObsPhotosWithPosition(
            selectedImages,
            { position: numOfObsPhotos, local: false },
          );

        // If the current observation is not synced, update the EXIF data from imported photos
        const unsynced = !currentObservation?._synced_at;
        let updatedCurrentObservation = unsynced
          ? await Observation
            .updateObsExifFromPhotos( importedPhotoUris, currentObservation )
          : currentObservation;

        updatedCurrentObservation = Observation
          .appendObsPhotos( obsPhotos, updatedCurrentObservation );

        const updatedObservations = [...observations];
        updatedObservations[currentObservationIndex] = updatedCurrentObservation;
        updateObservations( updatedObservations );

        navToObsEdit();
        setPhotoLibraryShown( false );
      } else if ( selectedImages.length === 1 ) {
        // create a new observation and skip group photos screen
        const newObservation = await Observation.createObservationWithPhotos( [selectedImages[0]] );
        // fetch place name to display on Match screen
        if ( newObservation.latitude ) {
          const placeName = await fetchPlaceName(
            newObservation.latitude,
            newObservation.longitude,
          );
          newObservation.place_guess = placeName;
        }
        setPhotoImporterState( {
          observations: [newObservation],
        } );
        navBasedOnUserSettings( );
        setPhotoLibraryShown( false );
      } else {
        // navigate to group photos
        setPhotoImporterState( {
          photoLibraryUris: [...photoLibraryUris, ...importedPhotoUris],
          groupedPhotos: selectedImages.map( photo => ( {
            photos: [photo],
          } ) ),
        } );
        navigation.setParams( { fromGroupPhotos: false } );
        navigation.navigate( "NoBottomTabStackNavigator", { screen: "GroupPhotos" } );
        setPhotoLibraryShown( false );
      }
    } catch ( error ) {
      logger.error( "Error importing photos from library", error );
      setPhotoLibraryShown( false );
      exitObservationFlow( );
    }
  }, [
    currentObservation,
    currentObservationIndex,
    evidenceToAdd,
    exitObservationFlow,
    fromGroupPhotos,
    photoLibraryUris,
    groupedPhotos,
    navigation,
    navToObsEdit,
    navBasedOnUserSettings,
    numOfObsPhotos,
    observations,
    params,
    photoLibraryShown,
    setGroupedPhotos,
    setPhotoImporterState,
    skipGroupPhotos,
    updateObservations,
    fromAICamera,
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
    }, [photoLibraryShown, showPhotoLibrary] ),
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
