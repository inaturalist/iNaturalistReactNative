// @flow

import TakePhoto from "components/Camera/Buttons/TakePhoto";
import { MediaNavButtons } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useMemo } from "react";
import DeviceInfo from "react-native-device-info";

const isTablet = DeviceInfo.isTablet();

type Props = {
  disabled: boolean,
  handleCheckmarkPress: any,
  handleClose: any,
  photosTaken: boolean,
  rotatableAnimatedStyle: any,
  takePhoto: any
}

const CameraNavButtons = ( {
  disabled,
  handleCheckmarkPress,
  handleClose,
  photosTaken,
  rotatableAnimatedStyle,
  takePhoto
}: Props ): Node => {
  const takePhotoButton = useMemo( ( ) => (
    <TakePhoto
      disabled={disabled}
      takePhoto={takePhoto}
    />
  ), [disabled, takePhoto] );

  if ( isTablet ) return null;

  return (
    <View testID="CameraNavButtons">
      <MediaNavButtons
        captureButton={takePhotoButton}
        mediaCaptured={photosTaken}
        onClose={handleClose}
        onConfirm={handleCheckmarkPress}
        rotatableAnimatedStyle={rotatableAnimatedStyle}
      />
    </View>
  );
};

export default CameraNavButtons;
