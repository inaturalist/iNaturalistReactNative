// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import CloseButton from "components/SharedComponents/Buttons/CloseButton";
import {
  Pressable, View
} from "components/styledComponents";
import { t } from "i18next";
import _ from "lodash";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useContext, useEffect, useRef, useState
} from "react";
import {
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

import { log } from "../../../react-native-logs.config";
import CameraView from "./CameraView";
import FadeInOutView from "./FadeInOutView";
import PhotoPreview from "./PhotoPreview";

export const MAX_PHOTOS_ALLOWED = 20;

const logger = log.extend( "StandardCamera" );

const StandardCamera = ( ): Node => {
  const {
    addCameraPhotosToCurrentObservation,
    createObsWithCameraPhotos,
    cameraPreviewUris,
    setCameraPreviewUris,
    allObsPhotoUris,
    evidenceToAdd,
    setEvidenceToAdd,
    setOriginalCameraUrisMap,
    originalCameraUrisMap
  } = useContext( ObsEditContext );
  const theme = useTheme( );
  const navigation = useNavigation( );
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
      setImageOrientation( orientation );
    }
  };

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

      // Remember original (unresized) camera URI
      setOriginalCameraUrisMap( { ...originalCameraUrisMap, [uri]: cameraPhoto.path } );

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
      logger.debug( "Calling addCameraPhotosToCurrentObservation: ", cameraPreviewUris );
      addCameraPhotosToCurrentObservation( evidenceToAdd );
      navigation.navigate( "ObsEdit" );
      return;
    }

    logger.debug( "Calling createObsWithCameraPhotos: ", cameraPreviewUris );
    createObsWithCameraPhotos( cameraPreviewUris );
    navigation.navigate( "ObsEdit" );
  };

  const renderAddObsButtons = icon => {
    let testID = "";
    let accessibilityLabel = "";
    switch ( icon ) {
      case "flash-on-circle":
        testID = "flash-button-label-flash";
        accessibilityLabel = t( "Flash-button-label-flash" );
        break;
      case "camera":
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

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      {device && <CameraView device={device} camera={camera} orientation={imageOrientation} />}
      <PhotoPreview
        photoUris={cameraPreviewUris}
        setPhotoUris={setCameraPreviewUris}
        savingPhoto={savingPhoto}
        deviceOrientation={imageOrientation}
      />
      <FadeInOutView savingPhoto={savingPhoto} />
      <View className="absolute bottom-0 w-full">
        <View className={`flex-row justify-between w-${footerWidth} mb-4 px-4`}>
          {hasFlash ? (
            <Pressable onPress={toggleFlash} accessibilityRole="button">
              {takePhotoOptions.flash === "on"
                ? renderAddObsButtons( "flash-on-circle" )
                : renderAddObsButtons( "camera" )}
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
              icon="camera"
              style={{ backgroundColor: colors.gray }}
            />
          </Pressable>
        </View>
        <View className="bg-black h-32 flex-row justify-between items-center">
          <View className="w-1/3">
            <CloseButton />
          </View>
          <IconButton
            icon="camera"
            onPress={takePhoto}
            disabled={disallowAddingPhotos}
            containerColor={theme.colors.surface}
          />
          <View className="w-1/3">
            {photosTaken && (
              <IconButton
                icon="checkmark"
                iconColor={theme.colors.onSecondary}
                containerColor={theme.colors.secondary}
                onPress={navToObsEdit}
                accessibilityLabel={t( "Navigate-to-observation-edit-screen" )}
                disabled={false}
              />
            )}
          </View>
        </View>
      </View>
      <Snackbar visible={showAlert} onDismiss={() => setShowAlert( false )}>
        {t( "You-can-only-upload-20-media" )}
      </Snackbar>
    </View>
  );
};

export default StandardCamera;
