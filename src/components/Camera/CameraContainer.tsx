import { useNavigation, useRoute } from "@react-navigation/native";
import type { Camera } from "components/Camera/helpers/visionCameraWrapper";
import {
  useCameraDevice,
  useCameraDevices
} from "components/Camera/helpers/visionCameraWrapper";
import { ActivityIndicator } from "components/SharedComponents";
import { View } from "components/styledComponents";
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
import fetchAccurateUserLocation from "sharedHelpers/fetchAccurateUserLocation";
import { log } from "sharedHelpers/logger";
import { createSentinelFile, deleteSentinelFile, logStage } from "sharedHelpers/sentinelFiles";
import { useTranslation } from "sharedHooks";
import useLocationPermission from "sharedHooks/useLocationPermission";
import useStore from "stores/useStore";

import CameraWithDevice from "./CameraWithDevice";
import savePhotosToPhotoLibrary from "./helpers/savePhotosToPhotoLibrary";
import savePhotoToDocumentsDirectory from "./helpers/savePhotoToDocumentsDirectory";
import usePrepareStoreAndNavigate from "./hooks/usePrepareStoreAndNavigate";
import useSavePhotoPermission from "./hooks/useSavePhotoPermission";

interface PhotoState {
  cameraUris: string[];
  evidenceToAdd: string[];
}

interface StoredResult {
  taxon: {
    rank_level: number;
    id: number;
    name: string;
    iconic_taxon_name: string;
  };
  combined_score: number;
  timestamp: number;
}

interface SavePhotoOptions {
  replaceExisting?: boolean;
  inactivateCallback?: () => void;
  navigateImmediately?: boolean;
  visionResult?: StoredResult | null;
}

export const MAX_PHOTOS_ALLOWED = 20;

const logger = log.extend( "CameraContainer" );

const CameraContainer = ( ) => {
  const currentObservation = useStore( state => state.currentObservation );
  const setCameraState = useStore( state => state.setCameraState );
  const evidenceToAdd = useStore( state => state.evidenceToAdd );
  const cameraUris = useStore( state => state.cameraUris );
  const newPhotoUris = useStore( state => state.newPhotoUris );
  const setNewPhotoUris = useStore( state => state.setNewPhotoUris );
  const sentinelFileName = useStore( state => state.sentinelFileName );
  const setSentinelFileName = useStore( state => state.setSentinelFileName );
  const addCameraRollUris = useStore( state => state.addCameraRollUris );

  const { params } = useRoute( );
  const cameraType = params?.camera;

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

  const {
    hasPermissions: hasLocationPermissions,
    renderPermissionsGate: renderLocationPermissionsGate,
    requestPermissions: requestLocationPermissions
  } = useLocationPermission( );
  // we don't want to use this for the observation location because
  // a user could be walking with the camera open for a while, so this location
  // will not reflect when they actually took the photo
  const [userLocationForGeomodel, setUserLocationForGeomodel] = useState( null );

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
  const devices = useCameraDevices( );
  const [loadingDevices, setLoadingDevices] = useState( true );
  const [timeoutId, setTimeoutId] = useState<undefined | ReturnType<typeof setTimeout> | null>(
    undefined
  );
  if ( timeoutId === undefined ) {
    setTimeoutId( setTimeout( () => {
      setLoadingDevices( false );
      setTimeoutId( null );
    }, 700 ) );
  }

  const hasFlash = device?.hasFlash;
  const initialPhotoOptions = {
    // We had this set to true in Seek but received many reports of it not respecting OS-wide sound
    // level and scared away wildlife. So maybe better to just disable it.
    enableShutterSound: false,
    ...( hasFlash && { flash: "off" } as const )
  } as const;
  const [takePhotoOptions, setTakePhotoOptions] = useState<TakePhotoOptions>( initialPhotoOptions );
  const [takingPhoto, setTakingPhoto] = useState( false );
  const addEvidence = params?.addEvidence;

  const camera = useRef<Camera>( null );

  useEffect( () => {
    const generateSentinelFile = async ( ) => {
      const fileName = await createSentinelFile( "AICamera" );
      setSentinelFileName( fileName );
    };
    if ( cameraType !== "AI" ) { return; }
    generateSentinelFile( );
  }, [setSentinelFileName, cameraType] );

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
    addPhotoPermissionResult
  } ), [addPhotoPermissionResult] );

  const prepareStoreAndNavigate = usePrepareStoreAndNavigate( );

  // passing newPhotoState because navigation to SuggestionsContainer for AICamera
  // happens before cameraUris state is ever set in useStore
  // and we want to make sure Suggestions has the correct observationPhotos
  const handleNavigation = useCallback( async (
    newPhotoState: PhotoState,
    visionResult: StoredResult | null
  ) => {
    // fetch accurate user location, with a fallback to a course location
    // at the time the user taps AI shutter or multicapture checkmark
    // to create an observation
    // this handles checking for location, and we do *not* want to show
    // location permissions in the camera, so we no longer need to check for that
    const accurateUserLocation = await fetchAccurateUserLocation( );
    await prepareStoreAndNavigate( {
      ...navigationOptions,
      userLocation: accurateUserLocation,
      newPhotoState,
      logStageIfAICamera,
      deleteStageIfAICamera,
      visionResult
    } );
  }, [
    prepareStoreAndNavigate,
    navigationOptions,
    logStageIfAICamera,
    deleteStageIfAICamera
  ] );

  const handleCheckmarkPress = useCallback( async (
    newPhotoState: PhotoState,
    visionResult: StoredResult | null
  ) => {
    if ( !showPhotoPermissionsGate ) {
      await handleNavigation( newPhotoState, visionResult );
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

  const updateTakePhotoStore = async (
    uri: string,
    options?: { replaceExisting?: boolean }
  ): Promise<PhotoState> => {
    const replaceExisting = options?.replaceExisting || false;

    let newCameraUris: string[] = [];
    let newEvidenceToAdd: string[] = [];

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

  const takePhotoAndStoreUri = async ( options: SavePhotoOptions ) => {
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
    const uri = await savePhotoToDocumentsDirectory( cameraPhoto );
    const newPhotoState = await updateTakePhotoStore( uri, options );
    if ( cameraType !== "AI" ) { setTakingPhoto( false ); }
    if ( options?.navigateImmediately ) {
      await handleCheckmarkPress( newPhotoState, options?.visionResult );
    }
    setNewPhotoUris( [...newPhotoUris, uri] );
    return uri;
  };

  useEffect( () => {
    const unsubscribe = navigation.addListener( "blur", () => {
      // This is only needed for the AI camera, since the multicapture camera is supposed to set
      // the takingPhoto state to false for each photo. In the AI camera, we want the buttons
      // only to reset after the user navigates away from the camera. (It doesn't hurt to also
      // reset the multicapture camera though I think.)
      setTakingPhoto( false );
    } );

    return unsubscribe;
  }, [navigation] );

  useEffect( ( ) => {
    const fetchLocation = async ( ) => {
      const accurateUserLocation = await fetchAccurateUserLocation( );
      setUserLocationForGeomodel( accurateUserLocation );
      return accurateUserLocation;
    };

    if ( hasLocationPermissions ) {
      fetchLocation( );
    }
  }, [hasLocationPermissions] );

  if ( loadingDevices ) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator />
      </View>
    );
  }

  if ( !loadingDevices && !device ) {
    Alert.alert(
      t( "No-Camera-Available" ),
      t( "Could-not-find-a-camera-on-this-device" )
    );
    logger.error(
      "Camera started but no device was found. Length of the list of all devices: ",
      devices.length
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
        userLocation={userLocationForGeomodel}
        hasLocationPermissions={hasLocationPermissions}
        requestLocationPermissions={requestLocationPermissions}
      />
      {showPhotoPermissionsGate && renderSavePhotoPermissionGate( {
        onPermissionGranted: async ( ) => {
          // we need this to make sure the very first photo after permission granted
          // is saved to device. very unlikely that we'll have a location here
          // since we're not prompting for permission, but there are a few scenarios where it
          // could happen, like a user enabling location on Explore before visiting the camera
          const accurateUserLocation = await fetchAccurateUserLocation( );
          const savedPhotoUris = await savePhotosToPhotoLibrary( cameraUris, accurateUserLocation );
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
