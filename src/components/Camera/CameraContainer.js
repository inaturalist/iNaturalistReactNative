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
  Platform,
  StatusBar
} from "react-native";
import DeviceInfo from "react-native-device-info";
import Orientation from "react-native-orientation-locker";
import {
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
  useCameraDevices
} from "react-native-vision-camera";
import Photo from "realmModels/Photo";
import useDeviceOrientation, {
  LANDSCAPE_LEFT,
  LANDSCAPE_RIGHT,
  PORTRAIT_UPSIDE_DOWN
} from "sharedHooks/useDeviceOrientation";

import ARCamera from "./ARCamera/ARCamera";
import StandardCamera from "./StandardCamera/StandardCamera";

const isTablet = DeviceInfo.isTablet( );

const CameraContainer = ( ): Node => {
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
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const addEvidence = params?.addEvidence;
  const cameraType = params?.camera;
  // $FlowFixMe
  const camera = useRef<Camera>( null );
  const [cameraPosition, setCameraPosition] = useState( "back" );
  const devices = useCameraDevices( );
  const device = devices[cameraPosition];
  const hasFlash = device?.hasFlash;
  const initialPhotoOptions = {
    enableAutoStabilization: true,
    qualityPrioritization: "quality",
    ...( hasFlash && { flash: "off" } )
  };
  const [takePhotoOptions, setTakePhotoOptions] = useState( initialPhotoOptions );
  const { deviceOrientation } = useDeviceOrientation( );
  const [showDiscardSheet, setShowDiscardSheet] = useState( false );
  const [takingPhoto, setTakingPhoto] = useState( false );
  const zoom = useSharedValue( 1 );
  const [zoomTextValue, setZoomTextValue] = useState( 1 );

  const isLandscapeMode = [LANDSCAPE_LEFT, LANDSCAPE_RIGHT].includes( deviceOrientation );

  const changeZoom = ( ) => {
    const currentZoomValue = zoomTextValue;
    if ( currentZoomValue === 1 ) {
      zoom.value = withSpring( 2 );
      setZoomTextValue( 2 );
    } else if ( currentZoomValue === 2 ) {
      zoom.value = withSpring( 3 );
      setZoomTextValue( 3 );
    } else {
      zoom.value = withSpring( 1 );
      setZoomTextValue( 1 );
    }
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
    let photoRotation = 0;
    switch ( cameraPhoto.metadata.Orientation ) {
      case 1:
        // Because the universe is a cruel, cruel place
        if ( Platform.OS === "android" ) {
          photoRotation = 180;
        }
        break;
      case 6:
        photoRotation = 90;
        break;
      case 8:
        photoRotation = 270;
        break;
      default:
        photoRotation = 0;
    }
    const newPhoto = await Photo.new( cameraPhoto.path, { rotation: photoRotation } );
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

  const flexDirection = isTablet && !isLandscapeMode
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
            zoom={zoomTextValue}
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
            zoom={zoomTextValue}
            navToObsEdit={navToObsEdit}
            photoSaved={cameraPreviewUris.length > 0}
          />
        )}
    </View>
  );
};

export default CameraContainer;
