// @flow

import classnames from "classnames";
import TransparentCircleButton, {
  CIRCLE_SIZE
} from "components/SharedComponents/Buttons/TransparentCircleButton.tsx";
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
    className={CIRCLE_SIZE}
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
  let accessibilityHint = "";
  let name = "";
  switch ( takePhotoOptions.flash ) {
    case "on":
      name = "flash-on";
      testID = "flash-button-label-flash";
      accessibilityHint = t( "Disable-flash" );
      break;
    default: // default to off if no flash
      name = "flash-off";
      testID = "flash-button-label-flash-off";
      accessibilityHint = t( "Enable-flash" );
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
        accessibilityLabel={t( "Flash" )}
        accessibilityHint={accessibilityHint}
        icon={name}
      />
    </Animated.View>
  );
};

export default Flash;
