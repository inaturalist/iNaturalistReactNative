// @flow

import classnames from "classnames";
import {
  CIRCLE_BUTTON_DIM
} from "components/SharedComponents/Buttons/TransparentCircleButton";
import INatText from "components/SharedComponents/Typography/INatText";
import { Pressable } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import DeviceInfo from "react-native-device-info";
import Animated from "react-native-reanimated";
import { useTranslation } from "sharedHooks";

const isTablet = DeviceInfo.isTablet();

const circleOptionsClasses = [
  "bg-black/50",
  `h-[${CIRCLE_BUTTON_DIM}px]`,
  "items-center",
  "justify-center",
  "rounded-full",
  `w-[${CIRCLE_BUTTON_DIM}px]`
].join( " " );

type Props = {
  rotatableAnimatedStyle: Object,
  changeZoom: Function,
  zoomClassName?: string,
  zoomTextValue: string,
  showZoomButton: boolean,
};

const CameraZoom = ( {
  rotatableAnimatedStyle,
  changeZoom,
  zoomClassName,
  zoomTextValue,
  showZoomButton
}: Props ): Node => {
  const { t } = useTranslation();

  if ( !showZoomButton ) {
    return null;
  }

  const zoomButtonText = `${zoomTextValue}×`;

  return (
    <Animated.View
      style={!isTablet && rotatableAnimatedStyle}
      className={classnames( zoomClassName, "m-0", "border-0" )}
    >
      <Pressable
        className={classnames( circleOptionsClasses )}
        onPress={changeZoom}
        accessibilityRole="button"
        accessibilityLabel={t( "Camera-button-zoom" )}
        accessibilityState={{ disabled: false }}
        size={20}
      >
        <INatText className="text-s font-semibold text-white">
          {zoomButtonText}
        </INatText>
      </Pressable>
    </Animated.View>
  );
};

export default CameraZoom;
