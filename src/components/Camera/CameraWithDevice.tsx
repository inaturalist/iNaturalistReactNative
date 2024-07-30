import { useIsFocused, useNavigation } from "@react-navigation/native";
import PermissionGateContainer, {
  READ_WRITE_MEDIA_PERMISSIONS
} from "components/SharedComponents/PermissionGateContainer.tsx";
import { View } from "components/styledComponents";
import React, {
  useCallback, useEffect, useRef, useState
} from "react";
import { StatusBar } from "react-native";
import DeviceInfo from "react-native-device-info";
import Orientation from "react-native-orientation-locker";
import { Camera, CameraDevice } from "react-native-vision-camera";
// import { log } from "sharedHelpers/logger";
import { useTranslation } from "sharedHooks";
import useDeviceOrientation, {
  LANDSCAPE_LEFT,
  LANDSCAPE_RIGHT
} from "sharedHooks/useDeviceOrientation.ts";
import useLocationPermission from "sharedHooks/useLocationPermission.tsx";

import AICamera from "./AICamera/AICamera";
import usePrepareStoreAndNavigate from "./hooks/usePrepareStoreAndNavigate";
import StandardCamera from "./StandardCamera/StandardCamera";

// const logger = log.extend( "CameraWithDevice" );

const isTablet = DeviceInfo.isTablet( );

interface Props {
  addEvidence: boolean,
  cameraType: string,
  cameraPosition: string,
  device: CameraDevice,
  setCameraPosition: Function,
}

const CameraWithDevice = ( {
  addEvidence,
  cameraType,
  cameraPosition,
  device,
  setCameraPosition
}: Props ) => {
  // screen orientation locked to portrait on small devices
  if ( !isTablet ) {
    Orientation.lockToPortrait( );
  }
  const navigation = useNavigation();
  const { t } = useTranslation( );
  const camera = useRef<Camera>( null );
  const { deviceOrientation } = useDeviceOrientation( );
  const [
    addPhotoPermissionResult,
    setAddPhotoPermissionResult
  ] = useState<"granted" | "denied" | null>( null );
  const [checkmarkTapped, setCheckmarkTapped] = useState( false );
  const [isNavigating, setIsNavigating] = useState( false );
  const [visionCameraResult, setVisionCameraResult] = useState( null );
  // We track this because we only want to navigate away when the permission
  // gate is completely closed, because there's a good chance another will
  // try to open when the user lands on the next screen, e.g. the location
  // permission gate on ObsEdit
  const [addPhotoPermissionGateWasClosed, setAddPhotoPermissionGateWasClosed] = useState( false );
  const isFocused = useIsFocused( );

  // Check if location permission granted b/c usePrepareStoreAndNavigate and
  // useUserLocation need to know if permission has been granted to fetch the
  // user's location while the camera is active. We don't want to *ask* for
  // permission here b/c we want to avoid overloading a new user with
  // permission requests and they will just have seen the camera permission
  // request before landing here, so it's ok if we're not fetching the
  // location here for the user's first observation (suggestions might be a
  // bit off and we'll fetch the obs coordinates on ObsEdit)
  const { hasPermissions } = useLocationPermission( );

  // logger.debug( `isFocused: ${isFocused}` );
  const prepareStoreAndNavigate = usePrepareStoreAndNavigate( {
    addPhotoPermissionResult,
    addEvidence,
    checkmarkTapped,
    // usePrepareStoreAndNavigate will fetch the location while the camera is
    // up and use that to pass along to Suggestions when the user navigates
    // there... but we only want to do that while the camera has focus and we
    // have permission
    shouldFetchLocation: isFocused && !!hasPermissions
  } );

  const isLandscapeMode = [LANDSCAPE_LEFT, LANDSCAPE_RIGHT].includes( deviceOrientation );

  const flipCamera = ( ) => {
    const newPosition = cameraPosition === "back"
      ? "front"
      : "back";
    setCameraPosition( newPosition );
  };

  const flexDirection = isTablet && isLandscapeMode
    ? "flex-row"
    : "flex-col";

  const storeCurrentObservationAndNavigate = useCallback( async ( ) => {
    await prepareStoreAndNavigate( visionCameraResult );
  }, [visionCameraResult, prepareStoreAndNavigate] );

  const handleCheckmarkPress = visionResult => {
    setVisionCameraResult( visionResult?.taxon
      ? visionResult
      : null );
    setCheckmarkTapped( true );
  };

  const onPhotoPermissionGranted = ( ) => {
    setAddPhotoPermissionResult( "granted" );
  };

  const onPhotoPermissionDenied = ( ) => {
    setAddPhotoPermissionResult( "denied" );
  };

  useEffect( ( ) => {
    if (
      checkmarkTapped
      && !isNavigating
      && (
        addPhotoPermissionGateWasClosed
        || addPhotoPermissionResult === "granted"
      )
    ) {
      setIsNavigating( true );
      setCheckmarkTapped( false );
      setAddPhotoPermissionGateWasClosed( false );
      storeCurrentObservationAndNavigate( );
      setIsNavigating( false );
    }
  }, [
    storeCurrentObservationAndNavigate,
    checkmarkTapped,
    addPhotoPermissionGateWasClosed,
    addPhotoPermissionResult,
    isNavigating
  ] );

  // Hide the StatusBar. Using a component doesn't guarantee that it will get
  // hidden here if another component renders the status bar later when this
  // screen his blurred but still mounted
  useEffect( ( ) => {
    // Hide on first render
    StatusBar.setHidden( true );
    const unsubscribe = navigation.addListener( "focus", ( ) => {
      // Hide when focused
      StatusBar.setHidden( true );
    } );
    return unsubscribe;
  }, [navigation] );

  useEffect( ( ) => {
    const unsubscribe = navigation.addListener( "blur", ( ) => {
      StatusBar.setHidden( false );
    } );
    return unsubscribe;
  }, [navigation] );

  return (
    <View
      className={`flex-1 bg-black ${flexDirection}`}
      testID="CameraWithDevice"
    >
      <PermissionGateContainer
        permissions={READ_WRITE_MEDIA_PERMISSIONS}
        title={t( "Save-photos-to-your-gallery" )}
        titleDenied={t( "Save-photos-to-your-gallery" )}
        body={t( "iNaturalist-can-save-photos-you-take-in-the-app-to-your-devices-gallery" )}
        buttonText={t( "SAVE-PHOTOS" )}
        icon="gallery"
        image={require( "images/birger-strahl-ksiGE4hMiso-unsplash.jpg" )}
        onModalHide={( ) => setAddPhotoPermissionGateWasClosed( true )}
        onPermissionGranted={onPhotoPermissionGranted}
        onPermissionDenied={onPhotoPermissionDenied}
        withoutNavigation
        permissionNeeded={checkmarkTapped}
      />
      {cameraType === "Standard"
        ? (
          <StandardCamera
            addEvidence={addEvidence}
            camera={camera}
            device={device}
            flipCamera={flipCamera}
            handleCheckmarkPress={handleCheckmarkPress}
            isLandscapeMode={isLandscapeMode}
          />
        )
        : (
          <AICamera
            camera={camera}
            device={device}
            flipCamera={flipCamera}
            handleCheckmarkPress={handleCheckmarkPress}
            isLandscapeMode={isLandscapeMode}
          />
        )}
    </View>
  );
};

export default CameraWithDevice;
