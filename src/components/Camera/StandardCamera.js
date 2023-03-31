// @flow

import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { CloseButton } from "components/SharedComponents";
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
import { useTranslation } from "react-i18next";
import {
  BackHandler,
  Dimensions, StatusBar
} from "react-native";
import DeviceInfo from "react-native-device-info";
import Orientation from "react-native-orientation-locker";
import {
  Avatar, IconButton, Snackbar, useTheme
} from "react-native-paper";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import Photo from "realmModels/Photo";
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
  const theme = useTheme( );
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

  const renderFlashButton = icon => {
    let testID = "";
    let accessibilityLabel = "";
    switch ( icon ) {
    case "flash-on":
      testID = "flash-button-label-flash";
      accessibilityLabel = t( "Flash-button-label-flash" );
      break;
    case "flash-off":
      testID = "flash-button-label-flash-off";
      accessibilityLabel = t( "Flash-button-label-flash-off" );
      break;
    default:
      break;
    }
    return (
      <Avatar.Icon
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        size={40}
        icon={icon}
        style={{ backgroundColor: colors.gray }}
      />
    );
  };

  const checkmarkClass = "w-[40px] h-[40px] my-auto";

  return (
    <>
      <View className="flex-1 bg-black">
        <StatusBar barStyle="light-content" />
        <PhotoPreview
          photoUris={cameraPreviewUris}
          setPhotoUris={setCameraPreviewUris}
          savingPhoto={savingPhoto}
        />
        <View className="relative flex-1">
          {device && <CameraView device={device} camera={camera} orientation={imageOrientation} />}
          <FadeInOutView savingPhoto={savingPhoto} />
        </View>
        <View className={`flex-row justify-between w-${footerWidth} mb-4 px-4`}>
          {hasFlash ? (
            <Pressable onPress={toggleFlash} accessibilityRole="button">
              {takePhotoOptions.flash === "on"
                ? renderFlashButton( "flash-on" )
                : renderFlashButton( "flash-off" )}
            </Pressable>
          ) : (
            <View />
          )}
          <Pressable
            onPress={flipCamera}
            accessibilityLabel={t( "Camera-button-label-switch-camera" )}
            accessibilityRole="button"
          >
            <Avatar.Icon
              testID="camera-button-label-switch-camera"
              size={40}
              icon="flip"
              style={{ backgroundColor: colors.darkGray }}
            />
          </Pressable>
        </View>
        <View className="h-[89px] flex-row justify-between items-center mx-7">
          <CloseButton handleClose={cameraPreviewUris.length > 0 && handleBackButtonPress} />
          <IconButton
            icon="camera"
            onPress={takePhoto}
            disabled={disallowAddingPhotos}
            containerColor={colors.white}
            size={50}
          />
          <View className={checkmarkClass}>
            {photosTaken && (
              <IconButton
                icon="checkmark"
                iconColor={theme.colors.onSecondary}
                containerColor={theme.colors.secondary}
                onPress={navToObsEdit}
                accessibilityLabel={t( "Navigate-to-observation-edit-screen" )}
                disabled={false}
                className={checkmarkClass}
              />
            )}
          </View>
        </View>
        <Snackbar visible={showAlert} onDismiss={() => setShowAlert( false )}>
          {t( "You-can-only-upload-20-media" )}
        </Snackbar>
      </View>
      {showDiscardSheet && (
        <DiscardChangesSheet
          setShowDiscardSheet={setShowDiscardSheet}
        />
      )}
    </>
  );
};

export default StandardCamera;
