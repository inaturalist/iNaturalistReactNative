// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Button, CloseButton, Heading4,
  List2
} from "components/SharedComponents";
import StandardBottomSheet from "components/SharedComponents/BottomSheet";
import BottomSheetStandardBackdrop from "components/SharedComponents/BottomSheetStandardBackdrop";
import {
  Pressable, View
} from "components/styledComponents";
import _ from "lodash";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useContext, useEffect, useRef, useState
} from "react";
import { useTranslation } from "react-i18next";
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

import CameraView from "./CameraView";
import FadeInOutView from "./FadeInOutView";
import PhotoPreview from "./PhotoPreview";

export const MAX_PHOTOS_ALLOWED = 20;

const INITIAL_DISCARD_STATE = {
  hide: true,
  action: null
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
  const [discardState, setDiscardState] = useState( INITIAL_DISCARD_STATE );

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

  useEffect(
    () => navigation.addListener( "beforeRemove", e => {
      if ( cameraPreviewUris.length === 0 ) {
        return;
      }

      // Prevent default behavior of leaving the screen
      e.preventDefault();

      setDiscardState( {
        hide: false,
        action: e.data.action
      } );
    } ),
    [navigation, cameraPreviewUris]
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

  const renderBackdrop = props => <BottomSheetStandardBackdrop props={props} />;

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      <PhotoPreview
        photoUris={cameraPreviewUris}
        setPhotoUris={setCameraPreviewUris}
        savingPhoto={savingPhoto}
        deviceOrientation={imageOrientation}
      />
      <View className="relative flex-1">
        {device && <CameraView device={device} camera={camera} orientation={imageOrientation} />}
        <FadeInOutView savingPhoto={savingPhoto} />
      </View>
      <View className="pt-[8px]">
        <View className={`flex-row justify-between w-${footerWidth} mb-4 px-4`}>
          {hasFlash ? (
            <Pressable onPress={toggleFlash} accessibilityRole="button">
              {takePhotoOptions.flash === "on"
                ? renderFlashButton( "flash-on-circle" )
                : renderFlashButton( "camera" )}
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
              style={{ backgroundColor: colors.darkGray }}
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
            containerColor={colors.white}
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
      <StandardBottomSheet
        snapPoints={[180]}
        hide={discardState.hide}
        backdropComponent={renderBackdrop}
        onChange={position => {
          if ( position === -1 ) {
            setDiscardState( INITIAL_DISCARD_STATE );
          }
        }}
      >
        <View className="px-[20px]">
          <View className="relative flex items-center justify-center mt-[22px]">
            <Heading4>{t( "DISCARD-PHOTOS" )}</Heading4>

            <View className="absolute right-0">
              <IconButton
                icon="close"
                onPress={() => setDiscardState( INITIAL_DISCARD_STATE )}
                accessibilityLabel={t( "Cancel" )}
                accessibilityState={{ disabled: false }}
              />
            </View>
          </View>
          <List2 className="my-[20px] text-center">
            {t( "By-exiting-your-photos-will-not-be-saved" )}
          </List2>
          <View className="flex flex-row">
            <Button
              level="neutral"
              text={t( "CANCEL" )}
              onPress={() => setDiscardState( INITIAL_DISCARD_STATE )}
              accessibilityLabel={t( "CANCEL" )}
              accessibilityState={{ disabled: false }}
            />
            <Button
              className="flex-1 ml-[12px]"
              level="warning"
              text={t( "DISCARD" )}
              accessibilityLabel={t( "DISCARD" )}
              onPress={() => navigation.dispatch( discardState.action )}
              accessibilityState={{ disabled: false }}
            />
          </View>
        </View>
      </StandardBottomSheet>
    </View>
  );
};

export default StandardCamera;
