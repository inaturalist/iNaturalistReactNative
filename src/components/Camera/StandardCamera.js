// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import classnames from "classnames";
import {
  Button, CloseButton, Heading4,
  INatIcon,
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
  IconButton, Snackbar
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
  const [discardState, setDiscardState] = useState( INITIAL_DISCARD_STATE );

  const isTablet = DeviceInfo.isTablet();

  const photosTaken = allObsPhotoUris.length > 0;

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
      <INatIcon
        name={icon}
        color={colors.white}
        size={20}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
      />
    );
  };

  const renderBackdrop = props => <BottomSheetStandardBackdrop props={props} />;

  const renderSmallScreenCameraOptions = () => (
    <>
      { hasFlash && (
        <Pressable
          className={`absolute bottom-[18px] left-[18px] ${cameraOptionsClassName}`}
          onPress={toggleFlash}
          accessibilityRole="button"
        >
          {takePhotoOptions.flash === "on"
            ? renderFlashButton( "flash-on" )
            : renderFlashButton( "flash-off" )}
        </Pressable>
      ) }
      <Pressable
        className={`absolute bottom-[18px] right-[18px] ${cameraOptionsClassName}`}
        onPress={flipCamera}
        accessibilityLabel={t( "Camera-button-label-switch-camera" )}
        accessibilityRole="button"
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

  const renderLargeScreenCameraOptions = () => (
    <View className="absolute top-0 bottom-0 right-0 justify-center items-center m-2">
      { hasFlash && (
        <Pressable
          className={`${cameraOptionsClassName} m-[12.5px]`}
          onPress={toggleFlash}
          accessibilityRole="button"
        >
          {takePhotoOptions.flash === "on"
            ? renderFlashButton( "flash-on" )
            : renderFlashButton( "flash-off" )}
        </Pressable>
      )}
      <Pressable
        className={` ${cameraOptionsClassName} m-[12.5px]`}
        onPress={flipCamera}
        accessibilityLabel={t( "Camera-button-label-switch-camera" )}
        accessibilityRole="button"
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
        className="bg-white rounded-full h-[60px] w-[60px] justify-center items-center m-[12.5px]"
        onPress={takePhoto}
        accessibilityLabel={t( "Navigate-to-observation-edit-screen" )}
        accessibilityRole="button"
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
      <View className={`${cameraOptionsClassName} m-[12.5px]`}>
        <CloseButton size={18} />
      </View>
    </View>
  );

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
        {!isTablet ? renderSmallScreenCameraOptions()
          : renderLargeScreenCameraOptions()}
      </View>
      { !isTablet
      && (
        <View className="bg-black h-32 flex-row justify-between items-center">
          <View className="w-1/3 ml-[20px]">
            <CloseButton />
          </View>
          <Pressable
            className="bg-white rounded-full h-[60px] w-[60px] justify-center items-center"
            onPress={takePhoto}
            accessibilityLabel={t( "Navigate-to-observation-edit-screen" )}
            accessibilityRole="button"
            disabled={disallowAddingPhotos}
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
