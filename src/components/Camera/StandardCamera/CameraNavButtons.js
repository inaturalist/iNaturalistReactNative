// @flow

import TakePhoto from "components/Camera/Buttons/TakePhoto";
import { MediaNavButtons } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useMemo } from "react";
import DeviceInfo from "react-native-device-info";

const isTablet = DeviceInfo.isTablet();

type Props = {
  takePhoto: Function,
  handleClose: Function,
  disallowAddingPhotos: boolean,
  photosTaken: boolean,
  rotatableAnimatedStyle: Object,
  handleCheckmarkPress: Function
}

const CameraNavButtons = ( {
  takePhoto,
  handleClose,
  disallowAddingPhotos,
  photosTaken,
  rotatableAnimatedStyle,
  handleCheckmarkPress
}: Props ): Node => {
  const takePhotoButton = useMemo( ( ) => (
    <TakePhoto
      disallowAddingPhotos={disallowAddingPhotos}
      takePhoto={takePhoto}
    />
  ), [disallowAddingPhotos, takePhoto] );

  if ( isTablet ) return null;

  return (
    <View testID="CameraNavButtons">
      <MediaNavButtons
        captureButton={takePhotoButton}
        onConfirm={handleCheckmarkPress}
        onClose={handleClose}
        mediaCaptured={photosTaken}
        rotatableAnimatedStyle={rotatableAnimatedStyle}
      />
    </View>
  );
};

export default CameraNavButtons;
