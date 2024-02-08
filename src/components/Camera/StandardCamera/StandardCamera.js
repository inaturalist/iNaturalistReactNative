// @flow

import { useFocusEffect, useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import CameraView from "components/Camera/CameraView";
import FadeInOutView from "components/Camera/FadeInOutView";
import useRotation from "components/Camera/hooks/useRotation";
import useTakePhoto from "components/Camera/hooks/useTakePhoto";
import useZoom from "components/Camera/hooks/useZoom";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import DeviceInfo from "react-native-device-info";
import { Snackbar } from "react-native-paper";
import { BREAKPOINTS } from "sharedHelpers/breakpoint";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation";
import useTranslation from "sharedHooks/useTranslation";
import useStore from "stores/useStore";

import {
  handleCameraError,
  handleCaptureError,
  handleClassifierError,
  handleDeviceNotSupported
} from "../helpers";
import CameraNavButtons from "./CameraNavButtons";
import CameraOptionsButtons from "./CameraOptionsButtons";
import DiscardChangesSheet from "./DiscardChangesSheet";
import useBackPress from "./hooks/useBackPress";
import PhotoPreview from "./PhotoPreview";

const isTablet = DeviceInfo.isTablet( );

export const MAX_PHOTOS_ALLOWED = 20;

type Props = {
  addEvidence: ?boolean,
  backToObsEdit: ?boolean,
  camera: any,
  device: any,
  flipCamera: Function,
  handleCheckmarkPress: Function,
  isLandscapeMode: boolean
};

const StandardCamera = ( {
  addEvidence,
  backToObsEdit,
  camera,
  device,
  flipCamera,
  handleCheckmarkPress,
  isLandscapeMode
}: Props ): Node => {
  const hasFlash = device?.hasFlash;
  const {
    animatedProps,
    changeZoom,
    onZoomChange,
    onZoomStart,
    showZoomButton,
    zoomTextValue,
    resetZoom
  } = useZoom( device );
  const {
    rotatableAnimatedStyle,
    rotation
  } = useRotation( );
  const {
    handleBackButtonPress,
    setShowDiscardSheet,
    showDiscardSheet
  } = useBackPress( backToObsEdit );
  const {
    takePhoto,
    takePhotoOptions,
    takingPhoto,
    toggleFlash
  } = useTakePhoto( camera, addEvidence, device );

  const navigation = useNavigation( );
  const { t } = useTranslation( );

  const cameraPreviewUris = useStore( state => state.cameraPreviewUris );
  const galleryUris = useStore( state => state.galleryUris );

  const totalObsPhotoUris = useMemo(
    ( ) => [...cameraPreviewUris, ...galleryUris].length,
    [cameraPreviewUris, galleryUris]
  );

  const disallowAddingPhotos = totalObsPhotoUris >= MAX_PHOTOS_ALLOWED;
  const [showAlert, setShowAlert] = useState( false );
  const [dismissChanges, setDismissChanges] = useState( false );
  const { screenWidth } = useDeviceOrientation( );

  const photosTaken = totalObsPhotoUris > 0;

  useFocusEffect(
    useCallback( ( ) => {
      // Reset camera zoom every time we get into a fresh camera view
      resetZoom();

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [] )
  );

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
          handleCheckmarkPress={handleCheckmarkPress}
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
        handleCheckmarkPress={handleCheckmarkPress}
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
