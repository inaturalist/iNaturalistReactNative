import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Camera, useCameraDevice
} from "components/Camera/helpers/visionCameraWrapper";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { Alert, StatusBar } from "react-native";
import type {
  TakePhotoOptions
} from "react-native-vision-camera";
import { createSentinelFile, deleteSentinelFile, logStage } from "sharedHelpers/sentinelFiles.ts";
import {
  useDeviceOrientation, useLayoutPrefs, useTranslation, useWatchPosition
} from "sharedHooks";
import useLocationPermission from "sharedHooks/useLocationPermission.tsx";
import useStore from "stores/useStore";

import CameraWithDevice from "./CameraWithDevice";
import savePhotosToPhotoLibrary from "./helpers/savePhotosToPhotoLibrary";
import saveRotatedPhotoToDocumentsDirectory from "./helpers/saveRotatedPhotoToDocumentsDirectory";
import usePrepareStoreAndNavigate from "./hooks/usePrepareStoreAndNavigate";
import useSavePhotoPermission from "./hooks/useSavePhotoPermission";

export const MAX_PHOTOS_ALLOWED = 20;

const CameraContainer = ( ) => {
  const {
    isDefaultMode
  } = useLayoutPrefs( );
  const currentObservation = useStore( state => state.currentObservation );
  const setCameraState = useStore( state => state.setCameraState );
  const evidenceToAdd = useStore( state => state.evidenceToAdd );
  const cameraUris = useStore( state => state.cameraUris );
  const sentinelFileName = useStore( state => state.sentinelFileName );
  const setSentinelFileName = useStore( state => state.setSentinelFileName );
  const addCameraRollUris = useStore( state => state.addCameraRollUris );

  const { params } = useRoute( );
  const cameraType = params?.camera;

  const showMatchScreen = cameraType === "AI"
    && isDefaultMode;
  const showSuggestionsScreen = cameraType === "AI"
    && !isDefaultMode;

  const logStageIfAICamera = useCallback( async (
    stageName: string,
    stageData: string
  ) => {
    if ( cameraType !== "AI" ) { return; }
    await logStage( sentinelFileName, stageName, stageData );
  }, [cameraType, sentinelFileName] );

  const deleteStageIfAICamera = useCallback( async ( ) => {
    if ( cameraType !== "AI" ) { return; }
    await deleteSentinelFile( sentinelFileName );
  }, [cameraType, sentinelFileName] );

  const { deviceOrientation } = useDeviceOrientation( );
  // Check if location permission granted b/c usePrepareStoreAndNavigate and
  // useUserLocation need to know if permission has been granted to fetch the
  // user's location while the camera is active. We don't want to *ask* for
  // permission here b/c we want to avoid overloading a new user with
  // permission requests and they will just have seen the camera permission
  // request before landing here, so it's ok if we're not fetching the
  // location here for the user's first observation (suggestions might be a
  // bit off and we'll fetch the obs coordinates on ObsEdit)
  const {
    hasPermissions: hasLocationPermissions,
    renderPermissionsGate: renderLocationPermissionsGate,
    requestPermissions: requestLocationPermissions
  } = useLocationPermission( );
  const { userLocation } = useWatchPosition( {
    shouldFetchLocation: !!( hasLocationPermissions )
  } );
  const navigation = useNavigation( );
  const { t } = useTranslation( );

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
  const [takePhotoOptions, setTakePhotoOptions] = useState<TakePhotoOptions>( initialPhotoOptions );
  const [takingPhoto, setTakingPhoto] = useState( false );
  const [newPhotoUris, setNewPhotoUris] = useState( [] );
  const addEvidence = params?.addEvidence;

  const camera = useRef<Camera>( null );

  useEffect( () => {
    const generateSentinelFile = async ( ) => {
      const fileName = await createSentinelFile( "AICamera" );
      setSentinelFileName( fileName );
      if ( hasLocationPermissions ) {
        await logStage( fileName, "fetch_user_location_start" );
      }
    };
    if ( cameraType !== "AI" ) { return; }
    generateSentinelFile( );
  }, [setSentinelFileName, cameraType, hasLocationPermissions] );

  const {
    hasPermissions: hasSavePhotoPermission,
    hasBlockedPermissions: hasBlockedSavePhotoPermission,
    renderPermissionsGate: renderSavePhotoPermissionGate,
    requestPermissions: requestSavePhotoPermission
  } = useSavePhotoPermission( );

  const showPhotoPermissionsGate = !( hasSavePhotoPermission || hasBlockedSavePhotoPermission );

  const addPhotoPermissionResult = hasSavePhotoPermission
    ? "granted"
    : "denied";

  const flipCamera = ( ) => {
    const newPosition = cameraPosition === "back"
      ? "front"
      : "back";
    setCameraPosition( newPosition );
  };

  const navigationOptions = useMemo( ( ) => ( {
    addPhotoPermissionResult,
    userLocation
  } ), [addPhotoPermissionResult, userLocation] );

  const prepareStoreAndNavigate = usePrepareStoreAndNavigate( );

  // passing newPhotoState because navigation to SuggestionsContainer for AICamera
  // happens before cameraUris state is ever set in useStore
  // and we want to make sure Suggestions has the correct observationPhotos
  const handleNavigation = useCallback( async ( newPhotoState = {} ) => {
    await prepareStoreAndNavigate( {
      ...navigationOptions,
      newPhotoState,
      logStageIfAICamera,
      deleteStageIfAICamera,
      showMatchScreen,
      showSuggestionsScreen
    } );
  }, [
    prepareStoreAndNavigate,
    navigationOptions,
    logStageIfAICamera,
    deleteStageIfAICamera,
    showMatchScreen,
    showSuggestionsScreen
  ] );

  const handleCheckmarkPress = useCallback( async newPhotoState => {
    if ( !showPhotoPermissionsGate ) {
      await handleNavigation( newPhotoState );
    } else {
      await logStageIfAICamera( "request_save_photo_permission_start" );
      requestSavePhotoPermission( );
    }
  }, [
    handleNavigation,
    requestSavePhotoPermission,
    showPhotoPermissionsGate,
    logStageIfAICamera
  ] );

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
    if ( options?.inactivateCallback ) options.inactivateCallback();
    await logStageIfAICamera( "take_photo_complete" );
    if ( !cameraPhoto ) {
      await logStageIfAICamera( "take_photo_error" );
      throw new Error( "Failed to take photo: missing camera" );
    }
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
        userLocation={userLocation}
        hasLocationPermissions={hasLocationPermissions}
        requestLocationPermissions={requestLocationPermissions}
      />
      {showPhotoPermissionsGate && renderSavePhotoPermissionGate( {
        onPermissionGranted: async ( ) => {
          const savedPhotoUris = await savePhotosToPhotoLibrary( cameraUris, userLocation );
          await logStageIfAICamera( "save_photos_to_photo_library_first_permission" );
          if ( savedPhotoUris.length > 0 ) {
            // Save these camera roll URIs, so later on observation editor can update
            // the EXIF metadata of these photos, once we retrieve a location.
            addCameraRollUris( savedPhotoUris );
          }
          await logStageIfAICamera( "request_save_photo_permission_complete" );
          await handleNavigation( {
            cameraUris,
            evidenceToAdd
          } );
        },
        onModalHide: async ( ) => {
          await logStageIfAICamera( "request_save_photo_permission_complete" );
          await handleNavigation( {
            cameraUris,
            evidenceToAdd
          } );
        }
      } )}
      {renderLocationPermissionsGate( {
        onRequestGranted: ( ) => console.log( "granted in location permission gate" ),
        onRequestBlocked: ( ) => console.log( "blocked in location permission gate" ),
        onModalHide: async ( ) => {
          await logStageIfAICamera( "request_location_permission_complete" );
        }
      } )}
    </>
  );
};

export default CameraContainer;
