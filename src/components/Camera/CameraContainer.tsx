import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Camera, useCameraDevice
} from "components/Camera/helpers/visionCameraWrapper";
import React, {
  useCallback,
  useRef, useState
} from "react";
import { Alert, StatusBar } from "react-native";
import type {
  TakePhotoOptions
} from "react-native-vision-camera";
import { useDeviceOrientation, useTranslation, useWatchPosition } from "sharedHooks";
import useLocationPermission from "sharedHooks/useLocationPermission.tsx";
import useStore from "stores/useStore";

import CameraWithDevice from "./CameraWithDevice";
import saveRotatedPhotoToDocumentsDirectory from "./helpers/saveRotatedPhotoToDocumentsDirectory";
import usePrepareStoreAndNavigate from "./hooks/usePrepareStoreAndNavigate";
import useSavePhotoPermission from "./hooks/useSavePhotoPermission";

export const MAX_PHOTOS_ALLOWED = 20;

const CameraContainer = ( ) => {
  const currentObservation = useStore( state => state.currentObservation );
  const setCameraState = useStore( state => state.setCameraState );
  const evidenceToAdd = useStore( state => state.evidenceToAdd );
  const cameraUris = useStore( state => state.cameraUris );

  const { deviceOrientation } = useDeviceOrientation( );
  // Check if location permission granted b/c usePrepareStoreAndNavigate and
  // useUserLocation need to know if permission has been granted to fetch the
  // user's location while the camera is active. We don't want to *ask* for
  // permission here b/c we want to avoid overloading a new user with
  // permission requests and they will just have seen the camera permission
  // request before landing here, so it's ok if we're not fetching the
  // location here for the user's first observation (suggestions might be a
  // bit off and we'll fetch the obs coordinates on ObsEdit)
  const { hasPermissions } = useLocationPermission( );
  const { userLocation } = useWatchPosition( {
    shouldFetchLocation: !!( hasPermissions )
  } );
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const { params } = useRoute( );
  const cameraType = params?.camera;

  const [cameraPosition, setCameraPosition] = useState<"front" | "back">( "back" );
  // https://react-native-vision-camera.com/docs/guides/devices#selecting-multi-cams
  const device = useCameraDevice( cameraPosition, {
    physicalDevices: [
      "ultra-wide-angle-camera",
      "wide-angle-camera",
      "telephoto-camera"
    ]
  } );
  const hasFlash = device?.hasFlash;
  const initialPhotoOptions = {
    // We had this set to true in Seek but received many reports of it not respecting OS-wide sound
    // level and scared away wildlife. So maybe better to just disable it.
    enableShutterSound: false,
    ...( hasFlash && { flash: "off" } as const )
  } as const;
  const [aiSuggestion, setAiSuggestion] = useState( null );
  const [takePhotoOptions, setTakePhotoOptions] = useState<TakePhotoOptions>( initialPhotoOptions );
  const [takingPhoto, setTakingPhoto] = useState( false );
  const [newPhotoUris, setNewPhotoUris] = useState( [] );
  const addEvidence = params?.addEvidence;

  const camera = useRef<Camera>( null );

  const {
    hasPermissions: hasSavePhotoPermission,
    hasBlockedPermissions: hasBlockedSavePhotoPermission,
    renderPermissionsGate: renderSavePhotoPermissionGate,
    requestPermissions: requestSavePhotoPermission
  } = useSavePhotoPermission( );

  const showPhotoPermissionsGate = !( hasSavePhotoPermission || hasBlockedSavePhotoPermission );

  const prepareStoreAndNavigate = usePrepareStoreAndNavigate( );
  const addPhotoPermissionResult = hasSavePhotoPermission
    ? "granted"
    : "denied";

  const flipCamera = ( ) => {
    const newPosition = cameraPosition === "back"
      ? "front"
      : "back";
    setCameraPosition( newPosition );
  };

  // passing newPhotoState because navigation to SuggestionsContainer for AICamera
  // happens before cameraUris state is ever set in useStore
  // and we want to make sure Suggestions has the correct observationPhotos
  const handleNavigation = useCallback( async ( newPhotoState = {} ) => {
    await prepareStoreAndNavigate( {
      visionResult: aiSuggestion,
      addPhotoPermissionResult,
      userLocation,
      newPhotoState
    } );
  }, [
    addPhotoPermissionResult,
    prepareStoreAndNavigate,
    userLocation,
    aiSuggestion
  ] );

  const handleCheckmarkPress = useCallback( async newPhotoState => {
    if ( !showPhotoPermissionsGate ) {
      await handleNavigation( newPhotoState );
    } else {
      requestSavePhotoPermission( );
    }
  }, [
    handleNavigation,
    requestSavePhotoPermission,
    showPhotoPermissionsGate] );

  const toggleFlash = ( ) => {
    setTakePhotoOptions( {
      ...takePhotoOptions,
      flash: takePhotoOptions.flash === "on"
        ? "off"
        : "on"
    } );
  };

  const updateTakePhotoStore = async ( uri, options ) => {
    const replaceExisting = options?.replaceExisting || false;

    let newCameraUris = [];
    let newEvidenceToAdd = [];

    if ( ( addEvidence || currentObservation?.observationPhotos?.length > 0 )
      && !replaceExisting ) {
      newCameraUris = cameraUris.concat( [uri] );
      newEvidenceToAdd = [...evidenceToAdd, uri];
    }

    newCameraUris = replaceExisting
      ? [uri]
      : cameraUris.concat( [uri] );
    newEvidenceToAdd = replaceExisting
      ? [uri]
      : [...evidenceToAdd, uri];

    const newCameraState = {
      cameraUris: [...newCameraUris],
      evidenceToAdd: [...newEvidenceToAdd]
    };
    setCameraState( newCameraState );

    return newCameraState;
  };

  const takePhotoAndStoreUri = async options => {
    setTakingPhoto( true );
    // Set the camera to inactive immediately after taking the photo,
    // this does leave a short period of time where the camera preview is still active
    // after taking the photo which we might to revisit if it doesn't look good.
    const cameraPhoto = await camera?.current?.takePhoto( takePhotoOptions );
    if ( !cameraPhoto ) {
      throw new Error( "Failed to take photo: missing camera" );
    }
    if ( options?.inactivateCallback ) options.inactivateCallback();
    const uri = await saveRotatedPhotoToDocumentsDirectory( cameraPhoto, deviceOrientation );
    const newPhotoState = await updateTakePhotoStore( uri, options );
    setTakingPhoto( false );
    if ( options?.navigateImmediately ) {
      await handleCheckmarkPress( newPhotoState );
    }
    setNewPhotoUris( [...newPhotoUris, uri] );
    return uri;
  };

  if ( !device ) {
    Alert.alert(
      t( "No-Camera-Available" ),
      t( "Could-not-find-a-camera-on-this-device" )
    );
    navigation.goBack();
    return null;
  }

  return (
    <>
      <StatusBar hidden />
      <CameraWithDevice
        camera={camera}
        cameraType={cameraType}
        device={device}
        flipCamera={flipCamera}
        handleCheckmarkPress={handleCheckmarkPress}
        toggleFlash={toggleFlash}
        takingPhoto={takingPhoto}
        takePhotoAndStoreUri={takePhotoAndStoreUri}
        takePhotoOptions={takePhotoOptions}
        newPhotoUris={newPhotoUris}
        setNewPhotoUris={setNewPhotoUris}
        setAiSuggestion={setAiSuggestion}
      />
      {showPhotoPermissionsGate && renderSavePhotoPermissionGate( {
        // If the user does not give location permissions in any form,
        // navigate to the location picker (if granted we just continue fetching the location)
        onRequestGranted: ( ) => console.log( "granted in permission gate" ),
        onRequestBlocked: ( ) => console.log( "blocked in permission gate" ),
        onModalHide: async ( ) => {
          await handleNavigation( {
            visionResult: aiSuggestion,
            addPhotoPermissionResult,
            userLocation
          } );
        }
      } )}
    </>
  );
};

export default CameraContainer;
