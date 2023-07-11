// @flow

import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import DeviceInfo from "react-native-device-info";

import CameraFlip from "./Buttons/CameraFlip";
import Close from "./Buttons/Close";
import Flash from "./Buttons/Flash";
import TakePhoto from "./Buttons/TakePhoto";

const isTablet = DeviceInfo.isTablet();

type Props = {
  takePhoto: Function,
  disallowAddingPhotos: boolean,
  rotatableAnimatedStyle: Object,
  toggleFlash: Function,
  flipCamera: Function,
  hasFlash: boolean,
  takePhotoOptions: Object
}

const ARCameraButtons = ( {
  takePhoto,
  disallowAddingPhotos,
  rotatableAnimatedStyle,
  flipCamera,
  toggleFlash,
  hasFlash,
  takePhotoOptions
}: Props ): Node => !isTablet && (
  <View className="bottom-10 absolute right-5 left-5">
    <View className="flex-row justify-end">
      <Flash
        toggleFlash={toggleFlash}
        hasFlash={hasFlash}
        takePhotoOptions={takePhotoOptions}
        rotatableAnimatedStyle={rotatableAnimatedStyle}
      />
    </View>
    <View className="flex-row justify-between items-center">
      <Close />
      <TakePhoto
        disallowAddingPhotos={disallowAddingPhotos}
        takePhoto={takePhoto}
      />
      <CameraFlip flipCamera={flipCamera} />
    </View>
  </View>
);

export default ARCameraButtons;
