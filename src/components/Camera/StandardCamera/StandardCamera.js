// @flow

import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import CameraView from "components/Camera/CameraView";
import FadeInOutView from "components/Camera/FadeInOutView";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useEffect,
  useState
} from "react";
import DeviceInfo from "react-native-device-info";
import { Snackbar } from "react-native-paper";
import { BREAKPOINTS } from "sharedHelpers/breakpoint";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation";
import useTranslation from "sharedHooks/useTranslation";

import {
  handleCameraError,
  handleCaptureError,
  handleClassifierError,
  handleDeviceNotSupported
} from "../helpers";
import CameraNavButtons from "./CameraNavButtons";
import CameraOptionsButtons from "./CameraOptionsButtons";
import DiscardChangesSheet from "./DiscardChangesSheet";
import PhotoPreview from "./PhotoPreview";

const isTablet = DeviceInfo.isTablet( );

export const MAX_PHOTOS_ALLOWED = 20;

type Props = {
  navToObsEdit: Function,
  flipCamera: Function,
  toggleFlash: Function,
  changeZoom: Function,
  takePhoto: Function,
  handleBackButtonPress: Function,
  rotatableAnimatedStyle: Object,
  rotation: any,
  isLandscapeMode: boolean,
  device: any,
  camera: any,
  hasFlash: boolean,
  takePhotoOptions: Object,
  setShowDiscardSheet: Function,
  showDiscardSheet: boolean,
  takingPhoto: boolean,
  animatedProps: any,
  zoomTextValue: string,
  showZoomButton: boolean,
  onZoomStart?: Function,
  onZoomChange?: Function,
  totalObsPhotoUris: number,
  cameraPreviewUris: Function
};

const StandardCamera = ( {
  navToObsEdit,
  flipCamera,
  toggleFlash,
  takePhoto,
  handleBackButtonPress,
  rotatableAnimatedStyle,
  rotation,
  isLandscapeMode,
  device,
  camera,
  hasFlash,
  takePhotoOptions,
  setShowDiscardSheet,
  showDiscardSheet,
  takingPhoto,
  changeZoom,
  animatedProps,
  zoomTextValue,
  showZoomButton,
  onZoomStart,
  onZoomChange,
  totalObsPhotoUris,
  cameraPreviewUris
}: Props ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const disallowAddingPhotos = totalObsPhotoUris >= MAX_PHOTOS_ALLOWED;
  const [showAlert, setShowAlert] = useState( false );
  const [dismissChanges, setDismissChanges] = useState( false );
  const { screenWidth } = useDeviceOrientation( );

  const photosTaken = totalObsPhotoUris > 0;

  useEffect( ( ) => {
    // We do this navigation indirectly (vs doing it directly in DiscardChangesSheet),
    // since we need for the bottom sheet of discard-changes to first finish dismissing,
    // only then we can do the navigation - otherwise, this causes the bottom sheet
    // to sometimes pop back up on the next screen - see GH issue #629
    if ( !showDiscardSheet ) {
      if ( dismissChanges ) {
        navigation.goBack();
      }
    }
  }, [dismissChanges, showDiscardSheet, navigation] );

  const handleTakePhoto = async ( ) => {
    if ( disallowAddingPhotos ) {
      setShowAlert( true );
      return;
    }
    await takePhoto( );
  };

  const containerClasses = ["flex-1"];
  if ( isTablet && isLandscapeMode ) {
    containerClasses.push( "flex-row" );
  }

  return (
    <View className={classnames( containerClasses )}>
      <PhotoPreview
        rotation={rotation}
        takingPhoto={takingPhoto}
        isLandscapeMode={isLandscapeMode}
        isLargeScreen={screenWidth > BREAKPOINTS.md}
        isTablet={isTablet}
        cameraPreviewUris={cameraPreviewUris}
      />
      <View className="relative flex-1">
        {device && (
          <CameraView
            cameraRef={camera}
            device={device}
            animatedProps={animatedProps}
            onZoomStart={onZoomStart}
            onZoomChange={onZoomChange}
            onClassifierError={handleClassifierError}
            onDeviceNotSupported={handleDeviceNotSupported}
            onCaptureError={handleCaptureError}
            onCameraError={handleCameraError}
          />
        )}
        <FadeInOutView takingPhoto={takingPhoto} />
        <CameraOptionsButtons
          takePhoto={handleTakePhoto}
          handleClose={handleBackButtonPress}
          disallowAddingPhotos={disallowAddingPhotos}
          photosTaken={photosTaken}
          rotatableAnimatedStyle={rotatableAnimatedStyle}
          navToObsEdit={navToObsEdit}
          toggleFlash={toggleFlash}
          flipCamera={flipCamera}
          hasFlash={hasFlash}
          takePhotoOptions={takePhotoOptions}
          changeZoom={changeZoom}
          zoomTextValue={zoomTextValue}
          showZoomButton={showZoomButton}
        />
      </View>
      <CameraNavButtons
        takePhoto={handleTakePhoto}
        handleClose={handleBackButtonPress}
        disallowAddingPhotos={disallowAddingPhotos}
        photosTaken={photosTaken}
        rotatableAnimatedStyle={rotatableAnimatedStyle}
        navToObsEdit={navToObsEdit}
      />
      <Snackbar visible={showAlert} onDismiss={() => setShowAlert( false )}>
        {t( "You-can-only-upload-20-media" )}
      </Snackbar>
      <DiscardChangesSheet
        setShowDiscardSheet={setShowDiscardSheet}
        hidden={!showDiscardSheet}
        onDiscard={() => {
          setDismissChanges( true );
        }}
      />
    </View>
  );
};

export default StandardCamera;
