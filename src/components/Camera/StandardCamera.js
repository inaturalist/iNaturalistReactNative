// @flow

import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import classnames from "classnames";
import {
  CloseButton,
  INatIcon
} from "components/SharedComponents";
import {
  Pressable, View
} from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback,
  useContext, useEffect, useRef, useState
} from "react";
import {
  BackHandler,
  StatusBar
} from "react-native";
import DeviceInfo from "react-native-device-info";
import Orientation from "react-native-orientation-locker";
import {
  IconButton,
  Snackbar
} from "react-native-paper";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import Photo from "realmModels/Photo";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

import CameraView, {
  LANDSCAPE_LEFT,
  LANDSCAPE_RIGHT,
  PORTRAIT
} from "./CameraView";
import DiscardChangesSheet from "./DiscardChangesSheet";
import FadeInOutView from "./FadeInOutView";
import PhotoPreview from "./PhotoPreview";

const isTablet = DeviceInfo.isTablet();

export const MAX_PHOTOS_ALLOWED = 20;

const CAMERA_BUTTON_DIM = 40;

function orientationLockerToCameraOrientation( orientation ) {
  // react-native-orientation-locker and react-native-vision-camera have
  // opposite definitions for landscape right/left, and different string
  // values for these constants
  switch ( orientation ) {
  case "LANDSCAPE-RIGHT":
    return LANDSCAPE_LEFT;
  case "LANDSCAPE-LEFT":
    return LANDSCAPE_RIGHT;
  default:
    return PORTRAIT;
  }
}

// Empty space where a camera button should be so buttons don't jump around
// when they appear or disappear
const CameraButtonPlaceholder = ( ) => (
  <View
    accessibilityElementsHidden
    aria-hidden
    className={classnames(
      `w-[${CAMERA_BUTTON_DIM}px]`,
      `h-[${CAMERA_BUTTON_DIM}px]`
    )}
  />
);

const StandardCamera = ( ): Node => {
  const {
    addCameraPhotosToCurrentObservation,
    createObsWithCameraPhotos,
    cameraPreviewUris,
    setCameraPreviewUris,
    allObsPhotoUris,
    evidenceToAdd,
    setEvidenceToAdd
  } = useContext( ObsEditContext );
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const { params } = useRoute( );
  const addEvidence = params?.addEvidence;
  // $FlowFixMe
  const camera = useRef<Camera>( null );
  const [cameraPosition, setCameraPosition] = useState( "back" );
  const devices = useCameraDevices( );
  const device = devices[cameraPosition];
  const hasFlash = device?.hasFlash;
  const initialPhotoOptions = hasFlash ? { flash: "off" } : { };
  const [takePhotoOptions, setTakePhotoOptions] = useState( initialPhotoOptions );
  const [savingPhoto, setSavingPhoto] = useState( false );
  const disallowAddingPhotos = allObsPhotoUris.length >= MAX_PHOTOS_ALLOWED;
  const [showAlert, setShowAlert] = useState( false );
  const [deviceOrientation, setDeviceOrientation] = useState(
    isTablet
      ? orientationLockerToCameraOrientation( Orientation.getInitialOrientation( ) )
      : PORTRAIT
  );
  const [showDiscardSheet, setShowDiscardSheet] = useState( false );

  const photosTaken = allObsPhotoUris.length > 0;
  const isLandscapeMode = [LANDSCAPE_LEFT, LANDSCAPE_RIGHT].includes( deviceOrientation );

  const cameraOptionsClassName = [
    "bg-black/50",
    `h-[${CAMERA_BUTTON_DIM}px]`,
    "items-center",
    "justify-center",
    "rounded-full",
    `w-[${CAMERA_BUTTON_DIM}px]`
  ].join( " " );

  const checkmarkClass = [
    "bg-inatGreen",
    "rounded-full",
    `h-[${CAMERA_BUTTON_DIM}px]`,
    `w-[${CAMERA_BUTTON_DIM}px]`,
    "justify-center",
    "items-center"
  ].join( " " );

  // screen orientation locked to portrait on small devices
  if ( !isTablet ) {
    Orientation.lockToPortrait();
  }

  // detect device rotation instead of using screen orientation change
  const onDeviceRotation = orientation => {
    if ( !isTablet ) {
      // We're not supporting rotation in phones, right?
      return;
    }
    setDeviceOrientation( orientationLockerToCameraOrientation( orientation ) );
  };
  const handleBackButtonPress = useCallback( ( ) => {
    if ( cameraPreviewUris.length === 0 ) { return; }

    setShowDiscardSheet( true );
  }, [setShowDiscardSheet, cameraPreviewUris] );

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

  useEffect( () => {
    Orientation.addDeviceOrientationListener( onDeviceRotation );

    return () => {
      Orientation.removeOrientationListener( onDeviceRotation );
    };
  } );

  const takePhoto = async ( ) => {
    setSavingPhoto( true );
    try {
      if ( disallowAddingPhotos ) {
        setShowAlert( true );
        setSavingPhoto( false );
        return;
      }
      const cameraPhoto = await camera.current.takePhoto( takePhotoOptions );
      const newPhoto = await Photo.new( cameraPhoto.path );
      const uri = newPhoto.localFilePath;

      setCameraPreviewUris( cameraPreviewUris.concat( [uri] ) );
      if ( addEvidence ) {
        setEvidenceToAdd( [...evidenceToAdd, uri] );
      }
      setSavingPhoto( false );
    } catch ( e ) {
      setSavingPhoto( false );
    }
  };

  const toggleFlash = ( ) => {
    setTakePhotoOptions( {
      ...takePhotoOptions,
      flash: takePhotoOptions.flash === "on" ? "off" : "on"
    } );
  };

  const flipCamera = ( ) => {
    const newPosition = cameraPosition === "back" ? "front" : "back";
    setCameraPosition( newPosition );
  };

  const navToObsEdit = ( ) => {
    if ( addEvidence ) {
      addCameraPhotosToCurrentObservation( evidenceToAdd );
      navigation.navigate( "ObsEdit" );
      return;
    }
    createObsWithCameraPhotos( cameraPreviewUris );
    navigation.navigate( "ObsEdit" );
  };

  const renderFlashButton = () => {
    if ( !hasFlash ) return <CameraButtonPlaceholder />;
    let testID = "";
    let accessibilityLabel = "";
    let name = "";
    const flashClassName = isTablet
      ? `m-[12.5px] ${cameraOptionsClassName}`
      : `absolute bottom-[18px] left-[18px] ${cameraOptionsClassName}`;
    switch ( takePhotoOptions.flash ) {
    case "on":
      name = "flash-on";
      testID = "flash-button-label-flash";
      accessibilityLabel = t( "Flash-button-label-flash" );
      break;
    default: // default to off if no flash
      name = "flash-off";
      testID = "flash-button-label-flash-off";
      accessibilityLabel = t( "Flash-button-label-flash-off" );
    }
    return (
      <IconButton
        className={classnames(
          [`${flashClassName}`],
          {
            "rotate-90": !isTablet && isLandscapeMode
          },
          "m-0"
        )}
        onPress={toggleFlash}
        accessibilityRole="button"
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: false }}
        icon={name}
        iconColor={colors.white}
        containerColor="rgba(0, 0, 0, 0.5)"
        size={20}
      />
    );
  };

  const renderSmallScreenCameraOptions = () => (
    <>
      { renderFlashButton( ) }
      <IconButton
        className={classnames(
          [`absolute bottom-[18px] right-[18px] ${cameraOptionsClassName}`],
          {
            "rotate-90": !isTablet && isLandscapeMode
          }
        )}
        onPress={flipCamera}
        accessibilityRole="button"
        accessibilityLabel={t( "Camera-button-label-switch-camera" )}
        accessibilityState={{ disabled: false }}
        icon="rotate"
        iconColor={colors.white}
        containerColor="rgba(0, 0, 0, 0.5)"
        size={20}
      />
    </>
  );

  const largeScreenCameraOptionsClasses = [
    "absolute",
    "bottom-0",
    "items-center",
    "justify-center",
    "mr-5",
    "pb-0",
    "right-0",
    "top-0"
  ];

  const renderLargeScreenCameraOptions = ( ) => (
    <View
      className={classnames(
        ...largeScreenCameraOptionsClasses,
        "pb-0"
      )}
    >
      { renderFlashButton( ) }
      <IconButton
        className={classnames( cameraOptionsClassName, "m-0", "mt-[25px]" )}
        onPress={flipCamera}
        accessibilityRole="button"
        accessibilityLabel={t( "Camera-button-label-switch-camera" )}
        accessibilityState={{ disabled: false }}
        icon="rotate"
        iconColor={colors.white}
        containerColor="rgba(0, 0, 0, 0.5)"
        size={20}
      />
      <Pressable
        className={classnames(
          "bg-white",
          "rounded-full",
          "h-[60px]",
          "w-[60px]",
          "justify-center",
          "items-center",
          `mt-[${CAMERA_BUTTON_DIM}px]`,
          `mb-[${CAMERA_BUTTON_DIM}px]`
        )}
        onPress={takePhoto}
        accessibilityLabel={t( "Navigate-to-observation-edit-screen" )}
        accessibilityRole="button"
        accessibilityState={{ disabled: disallowAddingPhotos }}
        disabled={disallowAddingPhotos}
      >
        <View className="border-[1.64px] rounded-full h-[49.2px] w-[49.2px]" />
      </Pressable>
      { photosTaken && (
        <Pressable
          className={classnames( checkmarkClass, "mb-[25px]" )}
          onPress={navToObsEdit}
          accessibilityLabel={t( "Navigate-to-observation-edit-screen" )}
          accessibilityRole="button"
          accessibilityState={{ disabled: false }}
          disabled={false}
        >
          <INatIcon
            name="checkmark"
            color={colors.white}
            size={20}
            testID="camera-button-label-switch-camera"
          />
        </Pressable>
      ) }
      <View
        className={classnames(
          cameraOptionsClassName,
          { "mb-[25px]": !photosTaken }
        )}
      >
        <CloseButton
          handleClose={cameraPreviewUris.length > 0 && handleBackButtonPress}
          size={18}
        />
      </View>
      { !photosTaken && <CameraButtonPlaceholder /> }
    </View>
  );

  const flexDirection = isTablet && !isLandscapeMode
    ? "flex-row"
    : "flex-col";
  return (
    <View className={`flex-1 bg-black ${flexDirection}`}>
      <StatusBar hidden />
      <PhotoPreview
        photoUris={cameraPreviewUris}
        setPhotoUris={setCameraPreviewUris}
        savingPhoto={savingPhoto}
        isLandscapeMode={isLandscapeMode}
        isLargeScreen={isTablet}
      />
      <View className="relative flex-1">
        {device && (
          <CameraView
            device={device}
            camera={camera}
            orientation={deviceOrientation}
          />
        )}
        <FadeInOutView savingPhoto={savingPhoto} />
        {isTablet
          ? renderLargeScreenCameraOptions()
          : renderSmallScreenCameraOptions()}
      </View>
      { !isTablet && (
        <View className="bg-black h-32 flex-row justify-between items-center">
          <View className="w-1/3 ml-[20px]">
            <CloseButton handleClose={cameraPreviewUris.length > 0 && handleBackButtonPress} />
          </View>
          <Pressable
            className="bg-white rounded-full h-[60px] w-[60px] justify-center items-center"
            onPress={takePhoto}
            accessibilityLabel={t( "Navigate-to-observation-edit-screen" )}
            accessibilityRole="button"
            accessibilityState={{ disabled: disallowAddingPhotos }}
          >
            <View className="border-[1.64px] rounded-full h-[49.2px] w-[49.2px]" />
          </Pressable>
          <View className="w-1/3 items-end mr-[20px]">
            {photosTaken && (
              <Pressable
                className={classnames( checkmarkClass, {
                  "rotate-0": deviceOrientation === "portrait",
                  "-rotate-90": deviceOrientation === LANDSCAPE_LEFT,
                  "rotate-90": deviceOrientation === LANDSCAPE_RIGHT
                } )}
                onPress={navToObsEdit}
                accessibilityLabel={t( "Navigate-to-observation-edit-screen" )}
                accessibilityRole="button"
                accessibilityState={{ disabled: false }}
                disabled={false}
              >
                <INatIcon
                  name="checkmark"
                  color={colors.white}
                  size={20}
                  testID="camera-button-label-switch-camera"
                />
              </Pressable>
            )}
          </View>
        </View>
      )}
      <Snackbar visible={showAlert} onDismiss={() => setShowAlert( false )}>
        {t( "You-can-only-upload-20-media" )}
      </Snackbar>
      {showDiscardSheet && (
        <DiscardChangesSheet
          setShowDiscardSheet={setShowDiscardSheet}
        />
      )}
    </View>
  );
};

export default StandardCamera;
