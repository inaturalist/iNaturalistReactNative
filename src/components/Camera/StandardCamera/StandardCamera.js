// @flow

import { useFocusEffect, useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import CameraView from "components/Camera/CameraView.tsx";
import FadeInOutView from "components/Camera/FadeInOutView.tsx";
import useRotation from "components/Camera/hooks/useRotation.ts";
import useZoom from "components/Camera/hooks/useZoom.ts";
import {
  SafeAreaView,
  View
} from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, {
  useCallback, useEffect,
  useMemo,
  useState
} from "react";
import DeviceInfo from "react-native-device-info";
import { Snackbar } from "react-native-paper";
import { VolumeManager } from "react-native-volume-manager";
import ObservationPhoto from "realmModels/ObservationPhoto.ts";
import { BREAKPOINTS } from "sharedHelpers/breakpoint";
import { log } from "sharedHelpers/logger";
import { useDeviceOrientation, usePerformance } from "sharedHooks";
import { isDebugMode } from "sharedHooks/useDebugMode";
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

const logger = log.extend( "StandardCamera" );

const isTablet = DeviceInfo.isTablet( );

export const MAX_PHOTOS_ALLOWED = 20;

type Props = {
  camera: Object,
  device: Object,
  flipCamera: Function,
  handleCheckmarkPress: Function,
  isLandscapeMode: boolean,
  toggleFlash: Function,
  takingPhoto: boolean,
  takePhotoAndStoreUri: Function,
  takePhotoOptions: Object,
  newPhotoUris: Array<Object>,
  setNewPhotoUris: Function
};

const StandardCamera = ( {
  camera,
  device,
  flipCamera,
  handleCheckmarkPress,
  isLandscapeMode,
  toggleFlash,
  takingPhoto,
  takePhotoAndStoreUri,
  takePhotoOptions,
  newPhotoUris,
  setNewPhotoUris
}: Props ): Node => {
  const hasFlash = device?.hasFlash;
  const {
    animatedProps,
    handleZoomButtonPress,
    pinchToZoom,
    resetZoom,
    showZoomButton,
    zoomTextValue
  } = useZoom( device );
  const {
    rotatableAnimatedStyle,
    rotation
  } = useRotation( );
  const navigation = useNavigation( );

  const { loadTime } = usePerformance( {
    isLoading: camera?.current !== null
  } );
  if ( isDebugMode( ) && loadTime ) {
    logger.info( loadTime );
  }

  const cameraUris = useStore( state => state.cameraUris );
  const prepareCamera = useStore( state => state.prepareCamera );
  const photoLibraryUris = useStore( state => state.photoLibraryUris );
  const deletePhotoFromObservation = useStore( state => state.deletePhotoFromObservation );

  const totalObsPhotoUris = useMemo(
    ( ) => [...cameraUris, ...photoLibraryUris].length,
    [cameraUris, photoLibraryUris]
  );

  const disallowAddingPhotos = totalObsPhotoUris >= MAX_PHOTOS_ALLOWED;
  const [showAlert, setShowAlert] = useState( false );
  const [initialVolume, setInitialVolume] = useState( null );

  const { screenWidth } = useDeviceOrientation( );

  // newPhotoUris tracks photos taken in *this* instance of the camera. The
  // camera might be instantiated with several cameraUris or
  // photoLibraryUris already in state, but we only want to show the CTA button or discard modal
  // when the user has taken a photo with *this* instance of the camera
  const photosTaken = newPhotoUris.length > 0 && totalObsPhotoUris > 0;
  const {
    handleBackButtonPress,
    setShowDiscardSheet,
    showDiscardSheet
  } = useBackPress( photosTaken );

  useFocusEffect(
    useCallback( ( ) => {
      // Reset camera zoom every time we get into a fresh camera view
      resetZoom( );
      prepareCamera();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [] )
  );

  const deletePhotoByUri = useCallback( async ( photoUri: string ) => {
    if ( !deletePhotoFromObservation ) return;
    deletePhotoFromObservation( photoUri );
    await ObservationPhoto.deletePhoto( photoUri );
    setNewPhotoUris( newPhotoUris.filter( uri => uri !== photoUri ) );
  }, [deletePhotoFromObservation, newPhotoUris, setNewPhotoUris] );

  const onFlipCamera = () => {
    resetZoom( );
    flipCamera( );
  };

  const containerClasses = ["flex-1"];
  if ( isTablet && isLandscapeMode ) {
    containerClasses.push( "flex-row" );
  }

  const handleDiscard = useCallback( ( ) => {
    newPhotoUris.forEach( uri => {
      deletePhotoByUri( uri );
    } );
    setNewPhotoUris( [] );
    navigation.goBack( );
  }, [deletePhotoByUri, navigation, newPhotoUris, setNewPhotoUris] );

  const handleTakePhoto = useCallback( ( ) => {
    if ( disallowAddingPhotos ) {
      setShowAlert( true );
      return;
    }
    takePhotoAndStoreUri( );
  }, [disallowAddingPhotos, takePhotoAndStoreUri] );

  useEffect( () => {
    if ( initialVolume === null ) {
      // Fetch the current volume to set the initial state
      VolumeManager.getVolume()
        .then( volume => {
          setInitialVolume( volume.volume );
        } );
    }

    const volumeListener = VolumeManager.addVolumeListener( ( ) => {
      if ( initialVolume !== null ) {
        // Hardware volume button pressed - take a photo
        handleTakePhoto();

        // Revert the volume to its previous state
        VolumeManager.setVolume( initialVolume );
      }
    } );

    // Suppress the native volume UI
    VolumeManager.showNativeVolumeUI( { enabled: false } );

    return () => {
      volumeListener.remove();
      VolumeManager.showNativeVolumeUI( { enabled: true } );
    };
  }, [handleTakePhoto, initialVolume] );

  return (
    <SafeAreaView className={classnames( containerClasses )}>
      <PhotoPreview
        rotation={rotation}
        takingPhoto={takingPhoto}
        isLandscapeMode={isLandscapeMode}
        isLargeScreen={screenWidth > BREAKPOINTS.md}
        isTablet={isTablet}
        photoUris={cameraUris}
        onDelete={deletePhotoByUri}
      />
      <View className="relative flex-1">
        {device && (
          <CameraView
            animatedProps={animatedProps}
            cameraRef={camera}
            cameraScreen="standard"
            device={device}
            onCameraError={handleCameraError}
            onCaptureError={handleCaptureError}
            onClassifierError={handleClassifierError}
            onDeviceNotSupported={handleDeviceNotSupported}
            pinchToZoom={pinchToZoom}
          />
        )}
        <FadeInOutView takingPhoto={takingPhoto} cameraType="Standard" />
        <CameraOptionsButtons
          handleZoomButtonPress={handleZoomButtonPress}
          disabled={disallowAddingPhotos}
          flipCamera={onFlipCamera}
          handleCheckmarkPress={handleCheckmarkPress}
          handleClose={handleBackButtonPress}
          hasFlash={hasFlash}
          photosTaken={photosTaken}
          rotatableAnimatedStyle={rotatableAnimatedStyle}
          showZoomButton={showZoomButton}
          takePhoto={takePhotoAndStoreUri}
          takePhotoOptions={takePhotoOptions}
          toggleFlash={toggleFlash}
          zoomTextValue={zoomTextValue}
        />
      </View>
      <CameraNavButtons
        disabled={disallowAddingPhotos || takingPhoto}
        handleCheckmarkPress={handleCheckmarkPress}
        handleClose={handleBackButtonPress}
        photosTaken={photosTaken}
        rotatableAnimatedStyle={rotatableAnimatedStyle}
        takePhoto={handleTakePhoto}
      />
      <Snackbar visible={showAlert} onDismiss={() => setShowAlert( false )}>
        {t( "You-can-only-add-20-photos-per-observation" )}
      </Snackbar>
      <DiscardChangesSheet
        setShowDiscardSheet={setShowDiscardSheet}
        hidden={!showDiscardSheet}
        onDiscard={handleDiscard}
      />
    </SafeAreaView>
  );
};

export default StandardCamera;
