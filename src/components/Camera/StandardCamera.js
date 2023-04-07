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
import _ from "lodash";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback,
  useContext, useEffect, useRef, useState
} from "react";
import {
  BackHandler,
  Dimensions, StatusBar
} from "react-native";
import DeviceInfo from "react-native-device-info";
import Orientation from "react-native-orientation-locker";
import {
  Snackbar
} from "react-native-paper";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import Photo from "realmModels/Photo";
import getBreakpoint from "sharedHelpers/breakpoint";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

import CameraView from "./CameraView";
import DiscardChangesSheet from "./DiscardChangesSheet";
import FadeInOutView from "./FadeInOutView";
import PhotoPreview from "./PhotoPreview";

export const MAX_PHOTOS_ALLOWED = 20;

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
  // const theme = useTheme( );
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const { params } = useRoute( );
  const addEvidence = params?.addEvidence;
  // $FlowFixMe
  const camera = useRef<Camera>( null );
  const [cameraPosition, setCameraPosition] = useState( "back" );
  const devices = useCameraDevices( "wide-angle-camera" );
  const device = devices[cameraPosition];
  const hasFlash = device?.hasFlash;
  const initialPhotoOptions = hasFlash ? { flash: "off" } : { };
  const [takePhotoOptions, setTakePhotoOptions] = useState( initialPhotoOptions );
  const [savingPhoto, setSavingPhoto] = useState( false );
  const disallowAddingPhotos = allObsPhotoUris.length >= MAX_PHOTOS_ALLOWED;
  const [showAlert, setShowAlert] = useState( false );
  const initialWidth = Dimensions.get( "screen" ).width;
  const [footerWidth, setFooterWidth] = useState( initialWidth );
  const [imageOrientation, setImageOrientation] = useState( "portrait" );
  const [showDiscardSheet, setShowDiscardSheet] = useState( false );

  const isTablet = DeviceInfo.isTablet();

  const photosTaken = allObsPhotoUris.length > 0;
  const breakpoint = getBreakpoint( initialWidth );

  // eslint-disable-next-line max-len
  const cameraOptionsClassName = "bg-black/50 w-[40px] h-[40px] justify-center items-center rounded-full";

  // screen orientation locked to portrait on small devices
  if ( !isTablet ) {
    Orientation.lockToPortrait();
  }

  // detect device rotation instead of using screen orientation change
  const onDeviceRotation = orientation => {
    // react-native-orientation-locker and react-native-vision-camera
    // have opposite definitions for landscape right/left
    if ( _.camelCase( orientation ) === "landscapeRight" ) {
      setImageOrientation( "landscapeLeft" );
    } else if ( _.camelCase( orientation ) === "landscapeLeft" ) {
      setImageOrientation( "landscapeRight" );
    } else {
      setImageOrientation( "portrait" );
    }
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

    // allows bottom buttons bar to fill entire width of screen on rotation
    Dimensions.addEventListener( "change", ( { window: { width } } ) => {
      if ( isTablet ) setFooterWidth( width );
    } );

    return () => {
      Orientation.removeOrientationListener( onDeviceRotation );
    };
  }, [isTablet, footerWidth] );

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
    let testID = "";
    let accessibilityLabel = "";
    let name = "";
    const flashClassName = ( !isTablet
      ? `absolute bottom-[18px] left-[18px] ${cameraOptionsClassName}`
      : `${cameraOptionsClassName} m-[12.5px]` );
    switch ( takePhotoOptions.flash ) {
    case "on":
      name = "flash-on";
      testID = "flash-button-label-flash";
      accessibilityLabel = t( "Flash-button-label-flash" );
      break;
    case "off":
      name = "flash-off";
      testID = "flash-button-label-flash-off";
      accessibilityLabel = t( "Flash-button-label-flash-off" );
      break;
    default:
      break;
    }
    return (
      <Pressable
        className={flashClassName}
        onPress={toggleFlash}
        accessibilityRole="button"
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: false }}
      >
        <INatIcon
          name={name}
          color={colors.white}
          size={20}
        />

      </Pressable>
    );
  };

  const renderSmallScreenCameraOptions = () => (
    <>
      { hasFlash && (
        renderFlashButton()
      ) }
      <Pressable
        className={`absolute bottom-[18px] right-[18px] ${cameraOptionsClassName}`}
        onPress={flipCamera}
        accessibilityLabel={t( "Camera-button-label-switch-camera" )}
        accessibilityRole="button"
        accessibilityState={{ disabled: false }}
      >
        <INatIcon
          name="rotate"
          color={colors.white}
          size={20}
          testID="camera-button-label-switch-camera"
        />
      </Pressable>
    </>
  );

  const checkmarkClass = "bg-inatGreen rounded-full h-[40px] w-[40px] justify-center items-center";

  const renderLargeScreenCameraOptions = () => {
    const buttonSpacing = ( imageOrientation.toLowerCase() === "portrait" )
      ? "space-y-[40px]" : "space-y-[32px]";
    return (
      // eslint-disable-next-line max-len
      <View className={` absolute top-0 bottom-0 right-0 justify-center items-center m-2 ${buttonSpacing} pb-0`}>
        { hasFlash && (
          renderFlashButton()
        )}
        <Pressable
          className={`${cameraOptionsClassName}`}
          onPress={flipCamera}
          accessibilityLabel={t( "Camera-button-label-switch-camera" )}
          accessibilityRole="button"
          accessibilityState={{ disabled: false }}
        >
          <INatIcon
            name="rotate"
            color={colors.white}
            size={20}
            testID="camera-button-label-switch-camera"
          />
        </Pressable>
        <Pressable
        // eslint-disable-next-line max-len
          className="bg-white rounded-full h-[60px] w-[60px] justify-center items-center"
          onPress={takePhoto}
          accessibilityLabel={t( "Navigate-to-observation-edit-screen" )}
          accessibilityRole="button"
          accessibilityState={{ disabled: disallowAddingPhotos }}
          disabled={disallowAddingPhotos}
        >
          <View className="border-[1.64px] rounded-full h-[49.2px] w-[49.2px]" />
        </Pressable>
        {photosTaken && (
          <Pressable
            className={checkmarkClass}
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
        <View className={`${cameraOptionsClassName}`}>
          <CloseButton
            handleClose={cameraPreviewUris.length > 0 && handleBackButtonPress}
            size={18}
          />
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      <PhotoPreview
        photoUris={cameraPreviewUris}
        setPhotoUris={setCameraPreviewUris}
        savingPhoto={savingPhoto}
        screenBreakpoint={breakpoint}
      />
      <View className="relative flex-1">
        {device && <CameraView device={device} camera={camera} orientation={imageOrientation} />}
        <FadeInOutView savingPhoto={savingPhoto} />
        {breakpoint === "sm" || breakpoint === "md" ? renderSmallScreenCameraOptions()
          : renderLargeScreenCameraOptions()}
      </View>
      { ( breakpoint === "sm" || breakpoint === "md" )
      && (
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
                  "rotate-0": imageOrientation === "portrait" && !isTablet,
                  "-rotate-90": imageOrientation === "landscapeLeft" && !isTablet,
                  "rotate-90": imageOrientation === "landscapeRight" && !isTablet
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
