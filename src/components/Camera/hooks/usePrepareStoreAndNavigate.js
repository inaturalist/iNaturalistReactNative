// @flow

import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { useNavigation } from "@react-navigation/native";
import useDeviceStorageFull from "components/Camera/hooks/useDeviceStorageFull";
import {
  permissionResultFromMultiple,
  READ_WRITE_MEDIA_PERMISSIONS
} from "components/SharedComponents/PermissionGateContainer.tsx";
import { t } from "i18next";
import {
  useCallback
} from "react";
import {
  Alert
} from "react-native";
import { checkMultiple, RESULTS } from "react-native-permissions";
import Observation from "realmModels/Observation";
import ObservationPhoto from "realmModels/ObservationPhoto";
import { log } from "sharedHelpers/logger";
import { useWatchPosition } from "sharedHooks";
import useStore from "stores/useStore";

import { displayName as appName } from "../../../../app.json";

const logger = log.extend( "usePrepareStoreAndNavigate" );

type Options = {
  addPhotoPermissionResult: ?string,
  addEvidence: ?boolean,
  checkmarkTapped: boolean,
  shouldFetchLocation: boolean
};

// Save URIs to camera gallery (if a photo was taken using the app,
// we want it accessible in the camera's folder, as if the user has taken those photos
// via their own camera app).
// One could argue this is a private method and shouldn't be exported and
// doesn't need to be tested... but hooks are complicated and this hook might
// be too complicated, so this at least makes it easy to test this one part
// ~~~kueda20240614
// $FlowIgnore
export async function savePhotosToCameraGallery(
  uris: [string],
  onEachSuccess: Function,
  location: Object
) {
  const readWritePermissionResult = permissionResultFromMultiple(
    await checkMultiple( READ_WRITE_MEDIA_PERMISSIONS )
  );
  uris.reduce(
    async ( memo, uri ) => {
      try {
        const saveOptions = {};
        // One quirk of CameraRoll is that if you want to write to an album, you
        // need readwrite permission, but we don't want to ask for that here
        // b/c it might come immediately after asking for *add only*
        // permission, so we're checking to see if we have that permission
        // and skipping the album if we don't
        if ( readWritePermissionResult === RESULTS.GRANTED ) {
          saveOptions.type = "photo";
          // Note: we do not translate our brand name, so this should not be
          // globalized
          saveOptions.album = appName;
        }
        if ( location ) {
          saveOptions.latitude = location.latitude;
          saveOptions.longitude = location.longitude;
          saveOptions.horizontalAccuracy = location.positional_accuracy;
        }
        const savedPhotoUri = await CameraRoll.save( uri, saveOptions );

        // Save these camera roll URIs, so later on observation editor can update
        // the EXIF metadata of these photos, once we retrieve a location.
        onEachSuccess( savedPhotoUri );
      } catch ( cameraRollSaveError ) {
        // should never get here since in usePrepareStoreAndNavigate we check for device full
        // and skip saving to gallery
        if (
          cameraRollSaveError.message.match( /No space left on device/ )
          || cameraRollSaveError.message.match( /PHPhotosErrorDomain error 3305/ )
        ) {
          Alert.alert(
            t( "Not-enough-space-left-on-device" ),
            t( "Not-enough-space-left-on-device-try-again" ),
            [{ text: t( "OK" ) }]
          );
          return;
        }
        // This means an iOS user denied access
        // (https://developer.apple.com/documentation/photokit/phphotoserror/code/accessuserdenied).
        // In theory we should not even have called this function when that
        // happens, but we're still seeing this in the logs. They should be
        // prompted to grant permission the next time they try so this is
        // probably safe to ignore.
        if ( !cameraRollSaveError.message.match( /error 3311/ ) ) {
          logger.error( cameraRollSaveError );
          return;
        }
        throw cameraRollSaveError;
      }
    },
    // We need the initial value even if we're not using it, otherwise reduce
    // will treat the first item in the array as the initial value and not
    // call the reducer function on it
    true
  );
}

const usePrepareStoreAndNavigate = ( options: Options ): Function => {
  const {
    addPhotoPermissionResult,
    addEvidence,
    checkmarkTapped,
    shouldFetchLocation
  } = ( options || {} );
  const navigation = useNavigation( );
  const setObservations = useStore( state => state.setObservations );
  const updateObservations = useStore( state => state.updateObservations );
  const evidenceToAdd = useStore( state => state.evidenceToAdd );
  const cameraUris = useStore( state => state.cameraUris );
  const currentObservation = useStore( state => state.currentObservation );
  const addCameraRollUri = useStore( state => state.addCameraRollUri );
  const currentObservationIndex = useStore( state => state.currentObservationIndex );
  const observations = useStore( state => state.observations );
  const setSavingPhoto = useStore( state => state.setSavingPhoto );
  const setCameraState = useStore( state => state.setCameraState );
  const { userLocation } = useWatchPosition( {
    shouldFetchLocation
  } );
  const { deviceStorageFull } = useDeviceStorageFull();

  const numOfObsPhotos = currentObservation?.observationPhotos?.length || 0;

  const createObsWithCameraPhotos = useCallback( async localFilePaths => {
    const newObservation = await Observation.new( );

    // 20240709 amanda - this is temporary since we'll want to move this code to
    // Suggestions after the changes to permissions github issue is complete, and
    // we'll be able to updateObservationKeys on the observation there
    if ( userLocation?.latitude ) {
      newObservation.latitude = userLocation?.latitude;
      newObservation.longitude = userLocation?.longitude;
      newObservation.positional_accuracy = userLocation?.positional_accuracy;
    }
    newObservation.observationPhotos = await ObservationPhoto
      .createObsPhotosWithPosition( localFilePaths, {
        position: 0,
        local: true
      } );
    setObservations( [newObservation] );
    if ( addPhotoPermissionResult !== RESULTS.GRANTED ) return Promise.resolve( );
    if ( deviceStorageFull ) return Promise.resolve( );
    return savePhotosToCameraGallery( cameraUris, addCameraRollUri, userLocation );
  }, [
    addCameraRollUri,
    addPhotoPermissionResult,
    cameraUris,
    setObservations,
    userLocation,
    deviceStorageFull
  ] );

  const updateObsWithCameraPhotos = useCallback( async ( ) => {
    const obsPhotos = await ObservationPhoto.createObsPhotosWithPosition(
      evidenceToAdd,
      {
        position: numOfObsPhotos,
        local: true
      }
    );
    const updatedCurrentObservation = Observation
      .appendObsPhotos( obsPhotos, currentObservation );
    observations[currentObservationIndex] = updatedCurrentObservation;
    updateObservations( observations );
    if ( addPhotoPermissionResult !== "granted" ) return Promise.resolve( );
    return savePhotosToCameraGallery( evidenceToAdd, addCameraRollUri );
  }, [
    addCameraRollUri,
    addPhotoPermissionResult,
    currentObservation,
    currentObservationIndex,
    evidenceToAdd,
    numOfObsPhotos,
    observations,
    updateObservations
  ] );

  const prepareStoreAndNavigate = useCallback( async visionResult => {
    if ( !checkmarkTapped ) { return null; }

    // save all to camera roll if save photo permission is given
    if ( addPhotoPermissionResult === "granted" ) {
      setSavingPhoto( true );
    }

    if ( addEvidence ) {
      await updateObsWithCameraPhotos( );
    } else {
      // when backing out from ObsEdit -> Suggestions -> Camera, create a
      // new observation
      await createObsWithCameraPhotos( cameraUris );
    }
    // When we've persisted photos to the observation, we don't need them in
    // state anymore
    setCameraState( { evidenceToAdd: [], cameraUris: [] } );
    if ( addEvidence ) {
      return navigation.goBack( );
    }
    return navigation.push( "Suggestions", {
      entryScreen: "CameraWithDevice",
      lastScreen: "CameraWithDevice",
      aiCameraSuggestion: visionResult
    } );
  }, [
    addEvidence,
    addPhotoPermissionResult,
    cameraUris,
    checkmarkTapped,
    createObsWithCameraPhotos,
    navigation,
    updateObsWithCameraPhotos,
    setCameraState,
    setSavingPhoto
  ] );

  return prepareStoreAndNavigate;
};

export default usePrepareStoreAndNavigate;
