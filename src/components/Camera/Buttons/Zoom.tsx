import classnames from "classnames";
import { Body3 } from "components/SharedComponents";
import {
  CIRCLE_OPTIONS_CLASSES, CIRCLE_SIZE
} from "components/SharedComponents/Buttons/TransparentCircleButton";
import { Pressable } from "components/styledComponents";
import React from "react";
import type { GestureResponderEvent, ViewStyle } from "react-native";
import DeviceInfo from "react-native-device-info";
import Animated from "react-native-reanimated";
import { useTranslation } from "sharedHooks";

const isTablet = DeviceInfo.isTablet();

interface Props {
  rotatableAnimatedStyle: ViewStyle;
  handleZoomButtonPress: ( _event: GestureResponderEvent ) => void;
  zoomClassName?: string;
  zoomTextValue: string;
}

const Zoom = ( {
  rotatableAnimatedStyle,
  handleZoomButtonPress,
  zoomClassName,
  zoomTextValue
}: Props ) => {
  const { t } = useTranslation();

  return (
    <Animated.View
      style={!isTablet && rotatableAnimatedStyle}
      className={classnames( zoomClassName )}
    >
      <Pressable
        className={classnames( CIRCLE_OPTIONS_CLASSES, CIRCLE_SIZE )}
        onPress={handleZoomButtonPress}
        accessibilityRole="button"
        accessibilityLabel={t( "Change-zoom" )}
        accessibilityState={{ disabled: false }}
      >
        <Body3 className="text-s text-white">
          {t( "zoom-x", { zoom: Number( zoomTextValue ) } )}
        </Body3>
      </Pressable>
    </Animated.View>
  );
};

export default Zoom;
