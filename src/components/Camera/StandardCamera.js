// @flow

import { View } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useContext,
  useState
} from "react";
import {
  Platform
} from "react-native";
import DeviceInfo from "react-native-device-info";
import { Snackbar } from "react-native-paper";
import { BREAKPOINTS } from "sharedHelpers/breakpoint";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation";
import useTranslation from "sharedHooks/useTranslation";

import CameraNavButtons from "./CameraNavButtons";
import CameraOptionsButtons from "./CameraOptionsButtons";
import CameraView from "./CameraView";
import DiscardChangesSheet from "./DiscardChangesSheet";
import FadeInOutView from "./FadeInOutView";
import PhotoPreview from "./PhotoPreview";

const isTablet = DeviceInfo.isTablet( );

export const MAX_PHOTOS_ALLOWED = 20;

type Props = {
  navToObsEdit: Function,
  flipCamera: Function,
  toggleFlash: Function,
  takePhoto: Function,
  handleBackButtonPress: Function,
  rotatableAnimatedStyle: Object,
  rotation: any,
  isLandscapeMode: boolean,
  device: any,
  camera: any,
  deviceOrientation: string,
  hasFlash: boolean,
  takePhotoOptions: Object,
  setShowDiscardSheet: Function,
  showDiscardSheet: boolean,
  savingPhoto: boolean
}

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
  deviceOrientation,
  hasFlash,
  takePhotoOptions,
  setShowDiscardSheet,
  showDiscardSheet,
  savingPhoto
}: Props ): Node => {
  const {
    allObsPhotoUris
  } = useContext( ObsEditContext );
  const { t } = useTranslation( );
  const disallowAddingPhotos = allObsPhotoUris.length >= MAX_PHOTOS_ALLOWED;
  const [showAlert, setShowAlert] = useState( false );
  const { screenWidth } = useDeviceOrientation( );

  const photosTaken = allObsPhotoUris.length > 0;

  const handleTakePhoto = async ( ) => {
    if ( disallowAddingPhotos ) {
      setShowAlert( true );
      return;
    }
    await takePhoto( );
  };

  return (
    <>
      <PhotoPreview
        rotation={rotation}
        savingPhoto={savingPhoto}
        isLandscapeMode={isLandscapeMode}
        isLargeScreen={screenWidth > BREAKPOINTS.md}
        isTablet={isTablet}
      />
      <View className="relative flex-1">
        {device && (
          <CameraView
            device={device}
            camera={camera}
            orientation={
              // In Android the camera won't set the orientation metadata
              // correctly without this, but in iOS it won't display the
              // preview correctly *with* it
              Platform.OS === "android"
                ? deviceOrientation
                : null
            }
          />
        )}
        <FadeInOutView savingPhoto={savingPhoto} />
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
      {showDiscardSheet && (
        <DiscardChangesSheet
          setShowDiscardSheet={setShowDiscardSheet}
        />
      )}
    </>
  );
};

export default StandardCamera;
