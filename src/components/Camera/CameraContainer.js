// @flow

import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { View } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback,
  useContext,
  useRef,
  useState
} from "react";
import {
  BackHandler,
  StatusBar
} from "react-native";
import DeviceInfo from "react-native-device-info";
import Orientation from "react-native-orientation-locker";
import {
  Extrapolate,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";
// Temporarily using a fork so this is to avoid that eslint error. Need to
// remove if/when we return to the main repo
import {
  Camera,
  useCameraDevice
} from "react-native-vision-camera";
import Photo from "realmModels/Photo";
import {
  rotatePhotoPatch,
  rotationLocalPhotoPatch,
  rotationTempPhotoPatch
} from "sharedHelpers/visionCameraPatches";
import useDeviceOrientation, {
  LANDSCAPE_LEFT,
  LANDSCAPE_RIGHT,
  PORTRAIT_UPSIDE_DOWN
} from "sharedHooks/useDeviceOrientation";

import ARCamera from "./ARCamera/ARCamera";
import StandardCamera from "./StandardCamera/StandardCamera";

const isTablet = DeviceInfo.isTablet( );

// This is taken from react-native-vision library itself: https://github.com/mrousavy/react-native-vision-camera/blob/9eed89aac6155eba155595f3e006707152550d0d/package/example/src/Constants.ts#L19 https://github.com/mrousavy/react-native-vision-camera/blob/9eed89aac6155eba155595f3e006707152550d0d/package/example/src/CameraPage.tsx#L34
// The maximum zoom factor you should be able to zoom in
const MAX_ZOOM_FACTOR = 20;
// Used for calculating the final zoom by pinch gesture
const SCALE_FULL_ZOOM = 3;

type Props = {
  addEvidence: ?boolean,
  cameraType: string,
  cameraPosition: string,
  device: Object,
  setCameraPosition: Function
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
  const {
    addCameraPhotosToCurrentObservation,
    createObsWithCameraPhotos,
    cameraPreviewUris,
    setCameraPreviewUris,
    evidenceToAdd,
    setEvidenceToAdd,
    setOriginalCameraUrisMap,
    originalCameraUrisMap
  } = useContext( ObsEditContext );
  const navigation = useNavigation();
  // $FlowFixMe
  const camera = useRef<Camera>( null );
  const hasFlash = device?.hasFlash;
  const initialPhotoOptions = {
    enableShutterSound: true,
    enableAutoStabilization: true,
    qualityPrioritization: "quality",
    ...( hasFlash && { flash: "off" } )
  };
  const [takePhotoOptions, setTakePhotoOptions] = useState( initialPhotoOptions );
  const { deviceOrientation } = useDeviceOrientation( );
  const [showDiscardSheet, setShowDiscardSheet] = useState( false );
  const [takingPhoto, setTakingPhoto] = useState( false );

  const zoom = useSharedValue( !device.isMultiCam
    ? device.minZoom
    : device.neutralZoom );
  const startZoom = useSharedValue( !device.isMultiCam
    ? device.minZoom
    : device.neutralZoom );
  const [zoomTextValue, setZoomTextValue] = useState( "1" );

  const isLandscapeMode = [LANDSCAPE_LEFT, LANDSCAPE_RIGHT].includes( deviceOrientation );

  const { minZoom } = device;
  const maxZoom = Math.min( device.maxZoom ?? 1, MAX_ZOOM_FACTOR );

  const changeZoom = ( ) => {
    const currentZoomValue = zoomTextValue;
    if ( currentZoomValue === "1" ) {
      zoom.value = withSpring( maxZoom );
      setZoomTextValue( "3" );
    } else if ( currentZoomValue === "3" ) {
      zoom.value = withSpring( minZoom );
      setZoomTextValue( ".5" );
    } else {
      zoom.value = withSpring( device.neutralZoom );
      setZoomTextValue( "1" );
    }
  };

  const onZoomStart = () => {
    startZoom.value = zoom.value;
  };

  const onZoomChange = scale => {
    // Calculate new zoom value (since scale factor is relative to initial pinch)
    const newScale = interpolate(
      scale,
      [1 - 1 / SCALE_FULL_ZOOM, 1, SCALE_FULL_ZOOM],
      [-1, 0, 1],
      Extrapolate.CLAMP
    );
    const newZoom = interpolate(
      newScale,
      [-1, 0, 1],
      [minZoom, startZoom.value, maxZoom],
      Extrapolate.CLAMP
    );
    zoom.value = newZoom;
  };

  const animatedProps = useAnimatedProps(
    () => ( { zoom: zoom.value } ),
    [zoom]
  );

  const rotation = useSharedValue( 0 );
  switch ( deviceOrientation ) {
    case LANDSCAPE_LEFT:
      rotation.value = -90;
      break;
    case LANDSCAPE_RIGHT:
      rotation.value = 90;
      break;
    case PORTRAIT_UPSIDE_DOWN:
      rotation.value = 180;
      break;
    default:
      rotation.value = 0;
  }
  const rotatableAnimatedStyle = useAnimatedStyle(
    () => ( {
      transform: [
        {
          rotateZ: withTiming( `${-1 * ( rotation?.value || 0 )}deg` )
        }
      ]
    } ),
    [rotation.value]
  );

  const handleBackButtonPress = useCallback( ( ) => {
    if ( cameraPreviewUris.length > 0 ) {
      setShowDiscardSheet( true );
    } else {
      navigation.goBack( );
    }
  }, [setShowDiscardSheet, cameraPreviewUris, navigation] );

  useFocusEffect(
    // note: cannot use navigation.addListener to trigger bottom sheet in tab navigator
    // since the screen is unfocused, not removed from navigation
    useCallback( ( ) => {
      // make sure an Android user cannot back out and accidentally discard photos
      const onBackPress = ( ) => {
        handleBackButtonPress( );
        return true;
      };

      BackHandler.addEventListener( "hardwareBackPress", onBackPress );

      return ( ) => BackHandler.removeEventListener( "hardwareBackPress", onBackPress );
    }, [handleBackButtonPress] )
  );

  const createOrUpdateEvidence = useCallback( prediction => {
    if ( addEvidence ) {
      addCameraPhotosToCurrentObservation( evidenceToAdd );
    } else {
      createObsWithCameraPhotos( cameraPreviewUris, prediction );
    }
  }, [
    addCameraPhotosToCurrentObservation,
    createObsWithCameraPhotos,
    cameraPreviewUris,
    addEvidence,
    evidenceToAdd
  ] );

  const navToObsEdit = useCallback( ( { prediction } ) => {
    createOrUpdateEvidence( prediction );
    navigation.navigate( "ObsEdit" );
  }, [
    createOrUpdateEvidence,
    navigation
  ] );

  const takePhoto = async ( ) => {
    setTakingPhoto( true );
    const cameraPhoto = await camera.current.takePhoto( takePhotoOptions );

    // Rotate the original photo depending on device orientation
    const photoRotation = rotationTempPhotoPatch( cameraPhoto, deviceOrientation );
    await rotatePhotoPatch( cameraPhoto, photoRotation );

    // Get the rotation for the local photo
    const rotationLocalPhoto = rotationLocalPhotoPatch( );

    // Create a local copy photo of the original
    const newPhoto = await Photo.new( cameraPhoto.path, {
      rotation: rotationLocalPhoto
    } );
    const uri = newPhoto.localFilePath;

    // Remember original (unresized) camera URI
    setOriginalCameraUrisMap( { ...originalCameraUrisMap, [uri]: cameraPhoto.path } );

    setCameraPreviewUris( cameraPreviewUris.concat( [uri] ) );
    if ( addEvidence ) {
      setEvidenceToAdd( [...evidenceToAdd, uri] );
    }
    setTakingPhoto( false );
  };

  const toggleFlash = ( ) => {
    setTakePhotoOptions( {
      ...takePhotoOptions,
      flash: takePhotoOptions.flash === "on"
        ? "off"
        : "on"
    } );
  };

  const flipCamera = ( ) => {
    const newPosition = cameraPosition === "back"
      ? "front"
      : "back";
    setCameraPosition( newPosition );
  };

  const flexDirection = isTablet && isLandscapeMode
    ? "flex-row"
    : "flex-col";

  return (
    <View className={`flex-1 bg-black ${flexDirection}`}>
      <StatusBar hidden />
      {cameraType === "Standard"
        ? (
          <StandardCamera
            navToObsEdit={navToObsEdit}
            flipCamera={flipCamera}
            toggleFlash={toggleFlash}
            takePhoto={takePhoto}
            handleBackButtonPress={handleBackButtonPress}
            rotatableAnimatedStyle={rotatableAnimatedStyle}
            rotation={rotation}
            isLandscapeMode={isLandscapeMode}
            device={device}
            camera={camera}
            hasFlash={hasFlash}
            takePhotoOptions={takePhotoOptions}
            setShowDiscardSheet={setShowDiscardSheet}
            showDiscardSheet={showDiscardSheet}
            takingPhoto={takingPhoto}
            changeZoom={changeZoom}
            animatedProps={animatedProps}
            zoomTextValue={zoomTextValue}
            showZoomButton={device.isMultiCam}
            onZoomStart={onZoomStart}
            onZoomChange={onZoomChange}
          />
        )
        : (
          <ARCamera
            flipCamera={flipCamera}
            toggleFlash={toggleFlash}
            takePhoto={takePhoto}
            rotatableAnimatedStyle={rotatableAnimatedStyle}
            device={device}
            camera={camera}
            hasFlash={hasFlash}
            takePhotoOptions={takePhotoOptions}
            takingPhoto={takingPhoto}
            changeZoom={changeZoom}
            animatedProps={animatedProps}
            zoomTextValue={zoomTextValue}
            showZoomButton={device.isMultiCam}
            navToObsEdit={navToObsEdit}
            photoSaved={cameraPreviewUris.length > 0}
            onZoomStart={onZoomStart}
            onZoomChange={onZoomChange}
          />
        )}
    </View>
  );
};

const CameraContainer = ( ): Node => {
  const { params } = useRoute( );
  const addEvidence = params?.addEvidence;
  const cameraType = params?.camera;
  const [cameraPosition, setCameraPosition] = useState( "back" );
  const device = useCameraDevice( cameraPosition );

  if ( !device ) {
    return null;
  }

  return (
    <CameraWithDevice
      addEvidence={addEvidence}
      cameraType={cameraType}
      cameraPosition={cameraPosition}
      setCameraPosition={setCameraPosition}
      device={device}
    />
  );
};

export default CameraContainer;
