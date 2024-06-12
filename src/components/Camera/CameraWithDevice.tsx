import { useIsFocused, useNavigation } from "@react-navigation/native";
import LocationPermissionGate from "components/SharedComponents/LocationPermissionGate";
import PermissionGateContainer, {
  LOCATION_PERMISSIONS,
  permissionResultFromMultiple,
  WRITE_MEDIA_PERMISSIONS
}
  from "components/SharedComponents/PermissionGateContainer";
import { View } from "components/styledComponents";
import React, {
  useCallback, useEffect, useRef, useState
} from "react";
import { StatusBar } from "react-native";
import DeviceInfo from "react-native-device-info";
import Orientation from "react-native-orientation-locker";
import {
  checkMultiple,
  Permission,
  RESULTS
} from "react-native-permissions";
import { Camera, CameraDevice } from "react-native-vision-camera";
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
  const [visionCameraResult, setVisionCameraResult] = useState( null );
  // We track this because we only want to navigate away when the permission
  // gate is completely closed, because there's a good chance another will
  // try to open when the user lands on the next screen, e.g. the location
  // permission gate on ObsEdit
  const [addPhotoPermissionGateWasClosed, setAddPhotoPermissionGateWasClosed] = useState( false );
  const isFocused = useIsFocused( );
  const [locationPermissionGranted, setLocationPermissionGranted] = useState( false );

  const prepareStoreAndNavigate = usePrepareStoreAndNavigate( {
    addPhotoPermissionResult,
    addEvidence,
    checkmarkTapped,
    // usePrepareStoreAndNavigate will fetch the location while the camera is
    // up and use that to pass along to Suggestions when the user navigates
    // there... but we only want to do that while the camera has focus and we
    // have permission
    shouldFetchLocation: isFocused && locationPermissionGranted
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
      && (
        addPhotoPermissionGateWasClosed
        || addPhotoPermissionResult === "granted"
      )
    ) {
      setCheckmarkTapped( false );
      setAddPhotoPermissionGateWasClosed( false );
      storeCurrentObservationAndNavigate( );
    }
  }, [
    storeCurrentObservationAndNavigate,
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

  // Check if location permission granted b/c usePrepareStoreAndNavigate and
  // useUserLocation need to know if permission has been granted to fetch the
  // user's location while the camera is active. We don't want to *ask* for
  // permission here b/c we want to avoid overloading a new user with
  // permission requests and they will just have seen the camera permission
  // request before landing here, so it's ok if we're not fetching the
  // location here for the user's first observation (suggestions might be a
  // bit off and we'll fetch the obs coordinates on ObsEdit)
  useEffect( ( ) => {
    async function checkLocationPermissions() {
      const permissionsResult = permissionResultFromMultiple(
        await checkMultiple( LOCATION_PERMISSIONS as Permission[] )
      );
      if ( permissionsResult === RESULTS.GRANTED ) {
        setLocationPermissionGranted( true );
      } else {
        console.warn(
          "Location permissions have not been granted. You probably need to use a PermissionGate"
        );
      }
    }
    checkLocationPermissions( );
  }, [] );

  return (
    <View
      className={`flex-1 bg-black ${flexDirection}`}
      testID="CameraWithDevice"
    >
      {/* TODO why is this even here? The camera doesn't need location
      permissions. Suggestions does. ~~~~kueda20240611 */}
      {/* a weird quirk of react-native-modal is you can show subsequent modals
        when a modal is nested in another modal. location permission is shown first
        because the save photo modal pops up a second system alert on iOS asking
        how much access to give */}
      <LocationPermissionGate
        permissionNeeded={checkmarkTapped}
        withoutNavigation
        onPermissionGranted={( ) => {
          // This probably doesn't do anything, but on the off chance we're
          // able to grab coordinates immediately after the user grants
          // permission, that will probably yield better suggestions on the
          // next screen than nothing.
          setLocationPermissionGranted( true );
        }}
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
