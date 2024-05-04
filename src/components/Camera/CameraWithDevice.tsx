import { useNavigation } from "@react-navigation/native";
import LocationPermissionGate from "components/SharedComponents/LocationPermissionGate";
import PermissionGateContainer, { WRITE_MEDIA_PERMISSIONS }
  from "components/SharedComponents/PermissionGateContainer";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback, useEffect, useRef, useState
} from "react";
import { StatusBar } from "react-native";
import DeviceInfo from "react-native-device-info";
import Orientation from "react-native-orientation-locker";
import { Camera } from "react-native-vision-camera";
import { useTranslation } from "sharedHooks";
import useDeviceOrientation, {
  LANDSCAPE_LEFT,
  LANDSCAPE_RIGHT
} from "sharedHooks/useDeviceOrientation";

import AICamera from "./AICamera/AICamera";
import usePrepareStoreAndNavigate from "./hooks/usePrepareStoreAndNavigate";
import StandardCamera from "./StandardCamera/StandardCamera";

const isTablet = DeviceInfo.isTablet( );

interface Props {
  addEvidence: boolean,
  cameraType: string,
  cameraPosition: string,
  device: Object,
  setCameraPosition: Function,
}

const CameraWithDevice = ( {
  addEvidence,
  cameraType,
  cameraPosition,
  device,
  setCameraPosition
}: Props ): Node => {
  // screen orientation locked to portrait on small devices
  if ( !isTablet ) {
    Orientation.lockToPortrait( );
  }
  const navigation = useNavigation();
  const { t } = useTranslation( );
  const camera = useRef<Camera>( null );
  const { deviceOrientation } = useDeviceOrientation( );
  const [addPhotoPermissionResult, setAddPhotoPermissionResult] = useState( null );
  const [checkmarkTapped, setCheckmarkTapped] = useState( false );
  const [visionCameraResult, setVisionCameraResult] = useState( null );
  // We track this because we only want to navigate away when the permission
  // gate is completely closed, because there's a good chance another will
  // try to open when the user lands on the next screen, e.g. the location
  // permission gate on ObsEdit
  const [addPhotoPermissionGateWasClosed, setAddPhotoPermissionGateWasClosed] = useState( false );

  const {
    prepareStateForObsEdit
  } = usePrepareStoreAndNavigate( addPhotoPermissionResult, addEvidence, checkmarkTapped );

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

  const storeCurrentObservation = useCallback( async ( ) => {
    await prepareStateForObsEdit( visionCameraResult );
  }, [visionCameraResult, prepareStateForObsEdit] );

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
      && (
        addPhotoPermissionGateWasClosed
        || addPhotoPermissionResult === "granted"
      )
    ) {
      setCheckmarkTapped( false );
      setAddPhotoPermissionGateWasClosed( false );
      storeCurrentObservation( );
    }
  }, [
    storeCurrentObservation,
    checkmarkTapped,
    addPhotoPermissionGateWasClosed,
    addPhotoPermissionResult
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
    <View className={`flex-1 bg-black ${flexDirection}`}>
      {/* a weird quirk of react-native-modal is you can show subsequent modals
        when a modal is nested in another modal. location permission is shown first
        because the save photo modal pops up a second system alert on iOS asking
        how much access to give */}
      <LocationPermissionGate
        permissionNeeded={checkmarkTapped}
        withoutNavigation
      >
        <PermissionGateContainer
          permissions={WRITE_MEDIA_PERMISSIONS}
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
      </LocationPermissionGate>
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
