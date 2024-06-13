// @flow

import { useFocusEffect, useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import CameraView from "components/Camera/CameraView.tsx";
import FadeInOutView from "components/Camera/FadeInOutView";
import useRotation from "components/Camera/hooks/useRotation";
import useTakePhoto from "components/Camera/hooks/useTakePhoto.ts";
import useZoom from "components/Camera/hooks/useZoom.ts";
import { View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import DeviceInfo from "react-native-device-info";
import { Snackbar } from "react-native-paper";
import ObservationPhoto from "realmModels/ObservationPhoto";
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

const { useRealm } = RealmContext;

const isTablet = DeviceInfo.isTablet( );

export const MAX_PHOTOS_ALLOWED = 20;

type Props = {
  addEvidence: ?boolean,
  camera: Object,
  device: Object,
  flipCamera: Function,
  handleCheckmarkPress: Function,
  isLandscapeMode: boolean
};

const StandardCamera = ( {
  addEvidence,
  camera,
  device,
  flipCamera,
  handleCheckmarkPress,
  isLandscapeMode
}: Props ): Node => {
  const deletePhotoFromObservation = useStore( state => state.deletePhotoFromObservation );
  const realm = useRealm( );
  const hasFlash = device?.hasFlash;
  const {
    animatedProps,
    changeZoom,
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
  const {
    takePhoto,
    takePhotoOptions,
    takingPhoto,
    toggleFlash
  } = useTakePhoto( camera, !!addEvidence, device );

  const { t } = useTranslation( );

  const rotatedOriginalCameraPhotos = useStore( state => state.rotatedOriginalCameraPhotos );
  const resetEvidenceToAdd = useStore( state => state.resetEvidenceToAdd );
  const galleryUris = useStore( state => state.galleryUris );

  const totalObsPhotoUris = useMemo(
    ( ) => [...rotatedOriginalCameraPhotos, ...galleryUris].length,
    [rotatedOriginalCameraPhotos, galleryUris]
  );

  const disallowAddingPhotos = totalObsPhotoUris >= MAX_PHOTOS_ALLOWED;
  const [showAlert, setShowAlert] = useState( false );
  const [dismissChanges, setDismissChanges] = useState( false );
  const [newPhotoUris, setNewPhotoUris] = useState( [] );

  const { screenWidth } = useDeviceOrientation( );

  // newPhotoUris tracks photos taken in *this* instance of the camera. The
  // camera might be instantiated with several rotatedOriginalCameraPhotos or
  // galleryUris already in state, but we only want to show the CTA button or discard modal
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
      resetEvidenceToAdd( );

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [] )
  );

  const deletePhotoByUri = useCallback( async ( photoUri: string ) => {
    if ( !deletePhotoFromObservation ) return;
    deletePhotoFromObservation( photoUri );
    await ObservationPhoto.deletePhoto( realm, photoUri );
    setNewPhotoUris( newPhotoUris.filter( uri => uri !== photoUri ) );
  }, [deletePhotoFromObservation, realm, newPhotoUris] );

  useEffect( ( ) => {
    // We do this navigation indirectly (vs doing it directly in DiscardChangesSheet),
    // since we need for the bottom sheet of discard-changes to first finish dismissing,
    // only then we can do the navigation - otherwise, this causes the bottom sheet
    // to sometimes pop back up on the next screen - see GH issue #629
    if ( !showDiscardSheet ) {
      if ( dismissChanges ) {
        newPhotoUris.forEach( uri => {
          deletePhotoByUri( uri );
        } );
        navigation.goBack();
      }
    }
  }, [dismissChanges, showDiscardSheet, navigation, newPhotoUris, deletePhotoByUri] );

  const handleTakePhoto = async ( ) => {
    if ( disallowAddingPhotos ) {
      setShowAlert( true );
      return;
    }
    const uri = await takePhoto( );
    setNewPhotoUris( [...newPhotoUris, uri] );
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
        rotatedOriginalCameraPhotos={rotatedOriginalCameraPhotos}
        onDelete={deletePhotoByUri}
      />
      <View className="relative flex-1">
        {device && (
          <CameraView
            animatedProps={animatedProps}
            cameraRef={camera}
            device={device}
            onCameraError={handleCameraError}
            onCaptureError={handleCaptureError}
            onClassifierError={handleClassifierError}
            onDeviceNotSupported={handleDeviceNotSupported}
            pinchToZoom={pinchToZoom}
          />
        )}
        <FadeInOutView takingPhoto={takingPhoto} />
        <CameraOptionsButtons
          changeZoom={changeZoom}
          disabled={disallowAddingPhotos}
          flipCamera={flipCamera}
          handleCheckmarkPress={handleCheckmarkPress}
          handleClose={handleBackButtonPress}
          hasFlash={hasFlash}
          photosTaken={photosTaken}
          rotatableAnimatedStyle={rotatableAnimatedStyle}
          showZoomButton={showZoomButton}
          takePhoto={handleTakePhoto}
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
        onDiscard={() => {
          setDismissChanges( true );
        }}
      />
    </View>
  );
};

export default StandardCamera;
