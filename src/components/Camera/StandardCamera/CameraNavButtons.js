// @flow

import classnames from "classnames";
import GreenCheckmark from "components/Camera/Buttons/GreenCheckmark";
import TakePhoto from "components/Camera/Buttons/TakePhoto";
import { CloseButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import DeviceInfo from "react-native-device-info";
import Animated from "react-native-reanimated";

const isTablet = DeviceInfo.isTablet();

const CAMERA_BUTTON_DIM = 40;

const checkmarkClasses = [
  "bg-inatGreen",
  "rounded-full",
  `h-[${CAMERA_BUTTON_DIM}px]`,
  `w-[${CAMERA_BUTTON_DIM}px]`,
  "justify-center",
  "items-center"
].join( " " );

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
}: Props ): Node => !isTablet && (
  <View
    className="h-32 flex-row justify-between items-center"
    testID="CameraNavButtons"
  >
    <CloseButton
      handleClose={handleClose}
      width="33%"
      height="100%"
    />
    <TakePhoto
      disallowAddingPhotos={disallowAddingPhotos}
      takePhoto={takePhoto}
    />
    {photosTaken
      ? (
        <Animated.View
          style={!isTablet && rotatableAnimatedStyle}
          className={classnames( checkmarkClasses, {
            "w-1/3 h-full bg-black": !isTablet
          } )}
        >
          <GreenCheckmark
            handleCheckmarkPress={handleCheckmarkPress}
          />
        </Animated.View>
      )
      : (
        <View className={classnames( checkmarkClasses, "w-1/3 h-full bg-black" )} />
      )}
  </View>
);

export default CameraNavButtons;
