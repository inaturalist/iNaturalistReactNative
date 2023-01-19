// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Pressable,
  Text, View
} from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useContext, useEffect, useRef, useState
} from "react";
import {
  Dimensions, Platform, StatusBar
} from "react-native";
import DeviceInfo from "react-native-device-info";
import Orientation, { OrientationLocker, PORTRAIT } from "react-native-orientation-locker";
import { Avatar, Snackbar } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import Photo from "realmModels/Photo";
import colors from "styles/tailwindColors";

import CameraView from "./CameraView";
import FadeInOutView from "./FadeInOutView";
import PhotoPreview from "./PhotoPreview";

export const MAX_PHOTOS_ALLOWED = 20;

const isTablet = DeviceInfo.isTablet();

// Taken from:
// https://developer.android.com/reference/androidx/exifinterface/media/ExifInterface#ORIENTATION_ROTATE_180()
const ORIENTATION_ROTATE_90 = 6;
const ORIENTATION_ROTATE_180 = 3;
const ORIENTATION_ROTATE_270 = 8;

// Calculates by how much we should rotate our image according to the detected orientation
const orientationToRotation = orientation => {
  // This issue only occurs on Android
  if ( Platform.OS !== "android" ) return 0;

  if ( orientation === ORIENTATION_ROTATE_90 ) return 90;
  if ( orientation === ORIENTATION_ROTATE_180 ) return 180;
  if ( orientation === ORIENTATION_ROTATE_270 ) return 270;

  return 0;
};

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
  const initialWidth = Dimensions.get( "screen" ).height;
  const [footerWidth, setFooterWidth] = useState( initialWidth );

  const photosTaken = allObsPhotoUris.length > 0;

  Orientation.lockToPortrait();

  useEffect( () => {
    Dimensions.addEventListener( "change", ( { window: { width, height } } ) => {
      console.log( height, width );
      if ( isTablet ) setFooterWidth( width );
    } );
  }, [] );

  const takePhoto = async ( ) => {
    console.log( "pressed" );
    setSavingPhoto( true );
    try {
      if ( disallowAddingPhotos ) {
        setShowAlert( true );
        setSavingPhoto( false );
        return;
      }
      const cameraPhoto = await camera.current.takePhoto( takePhotoOptions );
      const newPhoto = await Photo.new( cameraPhoto.path, {
        rotation:
          orientationToRotation( cameraPhoto.metadata.Orientation )
      } );
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

  const renderAddObsButtons = icon => {
    let testID = "";
    let accessibilityLabel = "";
    switch ( icon ) {
      case "flash":
        testID = "flash-button-label-flash";
        accessibilityLabel = t( "flash-button-label-flash" );
        break;
      case "flash-off":
        testID = "flash-button-label-flash-off";
        accessibilityLabel = t( "flash-button-label-flash-off" );
        break;
      case "camera-flip":
        testID = "camera-button-label-switch-camera";
        accessibilityLabel = t( "camera-button-label-switch-camera" );
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

  const renderCameraButton = ( icon, disabled ) => (
    <Avatar.Icon
      size={60}
      icon={icon}
      style={{ backgroundColor: disabled ? colors.gray : colors.white }}
    />
  );

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      {device && <CameraView device={device} camera={camera} />}
      <OrientationLocker
        orientation={PORTRAIT}
        onChange={orientation => console.log( "onChange", orientation )}
        onDeviceChange={orientation => console.log( "onDeviceChange", orientation )}
      />
      <PhotoPreview
        photoUris={cameraPreviewUris}
        setPhotoUris={setCameraPreviewUris}
        savingPhoto={savingPhoto}
      />
      <FadeInOutView savingPhoto={savingPhoto} />
      <View className="absolute bottom-0">
        <View className={`flex-row justify-between w-${footerWidth} mb-4 px-4`}>
          {hasFlash ? (
            <Pressable onPress={toggleFlash}>
              {takePhotoOptions.flash === "on"
                ? renderAddObsButtons( "flash" )
                : renderAddObsButtons( "flash-off" )}
            </Pressable>
          ) : <View />}
          <Pressable onPress={flipCamera}>
            {renderAddObsButtons( "camera-flip" )}
          </Pressable>
        </View>
        <View className={`bg-black h-32 w-${footerWidth} flex-row justify-between pt-4`}>
          <Pressable
            className="w-1/3 pt-4 pb-4 pl-3"
            onPress={( ) => navigation.goBack( )}
          >
            <Icon name="arrow-back-ios" size={25} color={colors.white} />
          </Pressable>
          <View className="w-1/3">
            <Pressable onPress={takePhoto} className="items-center">
              {renderCameraButton( "circle-outline", disallowAddingPhotos )}
            </Pressable>
          </View>
          {photosTaken ? (
            <Text className="text-white text-xl w-1/3 text-center pr-4" onPress={navToObsEdit}>
              {t( "Next" )}
            </Text>
          ) : <View className="w-1/3" />}
        </View>
      </View>
      <Snackbar
        visible={showAlert}
        onDismiss={( ) => setShowAlert( false )}
      >
        {t( "You-can-only-upload-20-media" )}
      </Snackbar>
    </View>
  );
};

export default StandardCamera;
