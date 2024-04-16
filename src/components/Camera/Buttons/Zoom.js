// @flow

import classnames from "classnames";
import {
  CIRCLE_BUTTON_DIM
} from "components/SharedComponents/Buttons/TransparentCircleButton";
import INatTextBold from "components/SharedComponents/Typography/INatTextBold";
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
        accessibilityLabel={t( "Change-zoom" )}
        accessibilityState={{ disabled: false }}
        size={20}
      >
        <INatTextBold className="text-s font-semibold text-white">
          {zoomButtonText}
        </INatTextBold>
      </Pressable>
    </Animated.View>
  );
};

export default CameraZoom;
