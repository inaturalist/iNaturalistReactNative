// @flow

import classnames from "classnames";
import TransparentCircleButton, {
  CIRCLE_BUTTON_DIM
} from "components/SharedComponents/Buttons/TransparentCircleButton";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import DeviceInfo from "react-native-device-info";
import Animated from "react-native-reanimated";
import { useTranslation } from "sharedHooks";

const isTablet = DeviceInfo.isTablet();

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
      `w-[${CIRCLE_BUTTON_DIM}px]`,
      `h-[${CIRCLE_BUTTON_DIM}px]`
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

  if ( !hasFlash ) return <CameraButtonPlaceholder />;
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
      <TransparentCircleButton
        onPress={toggleFlash}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        icon={name}
      />
    </Animated.View>
  );
};

export default Flash;
