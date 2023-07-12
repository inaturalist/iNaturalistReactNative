// @flow

import classnames from "classnames";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import DeviceInfo from "react-native-device-info";
import {
  IconButton
} from "react-native-paper";
import Animated from "react-native-reanimated";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

const isTablet = DeviceInfo.isTablet();

const CAMERA_BUTTON_DIM = 40;

const cameraOptionsClasses = [
  "bg-black/50",
  `h-[${CAMERA_BUTTON_DIM}px]`,
  "items-center",
  "justify-center",
  "rounded-full",
  `w-[${CAMERA_BUTTON_DIM}px]`
].join( " " );

type Props = {
  rotatableAnimatedStyle: Object,
  toggleFlash: Function,
  hasFlash: boolean,
  takePhotoOptions: Object,
  flashClassName?: string
}

// Empty space where a camera button should be so buttons don't jump around
// when they appear or disappear
const CameraButtonPlaceholder = ( ) => (
  <View
    accessibilityElementsHidden
    aria-hidden
    className={classnames(
      `w-[${CAMERA_BUTTON_DIM}px]`,
      `h-[${CAMERA_BUTTON_DIM}px]`
    )}
  />
);

const Flash = ( {
  rotatableAnimatedStyle,
  toggleFlash,
  hasFlash,
  takePhotoOptions,
  flashClassName
}: Props ): Node => {
  const { t } = useTranslation( );

  if ( hasFlash ) return <CameraButtonPlaceholder />;
  let testID = "";
  let accessibilityLabel = "";
  let name = "";
  switch ( takePhotoOptions.flash ) {
    case "on":
      name = "flash-on";
      testID = "flash-button-label-flash";
      accessibilityLabel = t( "Flash-button-label-flash" );
      break;
    default: // default to off if no flash
      name = "flash-off";
      testID = "flash-button-label-flash-off";
      accessibilityLabel = t( "Flash-button-label-flash-off" );
  }

  return (
    <Animated.View
      style={!isTablet && rotatableAnimatedStyle}
      className={classnames(
        flashClassName,
        "m-0",
        "border-0"
      )}
    >
      <IconButton
        className={classnames( cameraOptionsClasses )}
        onPress={toggleFlash}
        accessibilityRole="button"
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: false }}
        icon={name}
        iconColor={colors.white}
        size={20}
      />
    </Animated.View>
  );
};

export default Flash;
