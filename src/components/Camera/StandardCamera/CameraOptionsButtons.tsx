import CameraFlip from "components/Camera/Buttons/CameraFlip";
import Flash from "components/Camera/Buttons/Flash";
import Zoom from "components/Camera/Buttons/Zoom";
import TabletButtons from "components/Camera/TabletButtons";
import React from "react";
import DeviceInfo from "react-native-device-info";

const isTablet = DeviceInfo.isTablet( );

interface Props {
  takePhoto: ( ) => Promise<void>;
  handleClose: ( ) => void;
  disabled: boolean;
  photosTaken: boolean;
  rotatableAnimatedStyle: object;
  handleCheckmarkPress: ( ) => void;
  toggleFlash: ( ) => void;
  flipCamera: ( ) => void;
  handleZoomButtonPress: ( ) => void;
  hasFlash: boolean;
  takePhotoOptions: object;
  zoomTextValue: string;
  showZoomButton: boolean;
}

const CameraOptionsButtons = ( {
  takePhoto,
  handleClose,
  disabled,
  photosTaken,
  rotatableAnimatedStyle,
  handleCheckmarkPress,
  toggleFlash,
  flipCamera,
  hasFlash,
  takePhotoOptions,
  handleZoomButtonPress,
  zoomTextValue,
  showZoomButton,
}: Props ) => {
  const renderPhoneCameraOptions = () => (
    <>
      <Flash
        toggleFlash={toggleFlash}
        hasFlash={hasFlash}
        takePhotoOptions={takePhotoOptions}
        rotatableAnimatedStyle={rotatableAnimatedStyle}
        flashClassName="absolute bottom-[18px] left-[18px]"
      />
      <Zoom
        showZoomButton={showZoomButton}
        handleZoomButtonPress={handleZoomButtonPress}
        zoomTextValue={zoomTextValue}
        rotatableAnimatedStyle={rotatableAnimatedStyle}
        zoomClassName="absolute bottom-[18px] self-center"
      />
      <CameraFlip
        flipCamera={flipCamera}
        rotatableAnimatedStyle={rotatableAnimatedStyle}
        cameraFlipClassName="absolute bottom-[18px] right-[18px]"
      />
    </>
  );

  const renderTabletCameraOptions = () => (
    <TabletButtons
      takePhoto={takePhoto}
      handleClose={handleClose}
      disabled={disabled}
      // TODO: once we re-visit tablet views, we'll want to ensure users cannot spam the submit
      // button while taking photos. see:
      // https://linear.app/inaturalist/issue/MOB-1084/multicapture-camera-multiple-copies-of-photos-can-be-saved
      // confirmDisabled={confirmDisabled}
      photosTaken={photosTaken}
      rotatableAnimatedStyle={rotatableAnimatedStyle}
      handleCheckmarkPress={handleCheckmarkPress}
      toggleFlash={toggleFlash}
      flipCamera={flipCamera}
      hasFlash={hasFlash}
      takePhotoOptions={takePhotoOptions}
      handleZoomButtonPress={handleZoomButtonPress}
      zoomTextValue={zoomTextValue}
      showZoomButton={showZoomButton}
    />
  );

  return isTablet
    ? renderTabletCameraOptions( )
    : renderPhoneCameraOptions( );
};

export default CameraOptionsButtons;
