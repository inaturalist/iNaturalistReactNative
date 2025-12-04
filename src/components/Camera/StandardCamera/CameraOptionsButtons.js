// @flow

import classnames from "classnames";
import CameraFlip from "components/Camera/Buttons/CameraFlip";
import Flash from "components/Camera/Buttons/Flash";
import Zoom from "components/Camera/Buttons/Zoom";
import TabletButtons from "components/Camera/TabletButtons";
import type { Node } from "react";
import React from "react";
import DeviceInfo from "react-native-device-info";
import Animated from "react-native-reanimated";

const isTablet = DeviceInfo.isTablet();

type Props = {
  takePhoto: () => Promise<void>,
  handleClose: Function,
  disabled: boolean,
  photosTaken: boolean,
  rotatableAnimatedStyle: Object,
  handleCheckmarkPress: Function,
  toggleFlash: Function,
  flipCamera: Function,
  handleZoomButtonPress: Function,
  hasFlash: boolean,
  takePhotoOptions: Object,
  zoomTextValue: string,
  showZoomButton: boolean
};

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
  showZoomButton
}: Props ): Node => {
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
      <Animated.View
        style={!isTablet && rotatableAnimatedStyle}
        className={classnames( "absolute", "bottom-[18px]", "right-[18px]" )}
      >
        <CameraFlip flipCamera={flipCamera} />
      </Animated.View>
    </>
  );

  const renderTabletCameraOptions = () => (
    <TabletButtons
      takePhoto={takePhoto}
      handleClose={handleClose}
      disabled={disabled}
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
