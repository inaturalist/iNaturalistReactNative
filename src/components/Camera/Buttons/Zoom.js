// @flow

import classnames from "classnames";
import { Body3 } from "components/SharedComponents";
import {
  CIRCLE_OPTIONS_CLASSES, CIRCLE_SIZE
} from "components/SharedComponents/Buttons/TransparentCircleButton.tsx";
import { Pressable } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import DeviceInfo from "react-native-device-info";
import Animated from "react-native-reanimated";
import { useTranslation } from "sharedHooks";

const isTablet = DeviceInfo.isTablet();

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
      className={classnames( zoomClassName )}
    >
      <Pressable
        className={classnames( CIRCLE_OPTIONS_CLASSES, CIRCLE_SIZE )}
        onPress={changeZoom}
        accessibilityRole="button"
        accessibilityLabel={t( "Change-zoom" )}
        accessibilityState={{ disabled: false }}
      >
        <Body3 className="text-s text-white">
          {zoomButtonText}
        </Body3>
      </Pressable>
    </Animated.View>
  );
};

export default CameraZoom;
