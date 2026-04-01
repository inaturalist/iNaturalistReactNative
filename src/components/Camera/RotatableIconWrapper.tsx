import type { PropsWithChildren } from "react";
import React from "react";
import type { ViewStyle } from "react-native";
import { View } from "react-native";
import DeviceInfo from "react-native-device-info";
import type { AnimatedStyle } from "react-native-reanimated";
import Animated from "react-native-reanimated";

interface Props extends PropsWithChildren {
  rotatableAnimatedStyle?: ViewStyle | AnimatedStyle;
  containerClass?: string;
}

const isTablet = DeviceInfo.isTablet();

const RotatableIconWrapper = ({
  children,
  rotatableAnimatedStyle,
  containerClass,
}: Props) => {
  if (isTablet || !rotatableAnimatedStyle) {
    return (
      <View className={containerClass}>
        {children}
      </View>
    );
  }

  return (
    <Animated.View
      style={rotatableAnimatedStyle}
      className={containerClass}
    >
      {children}
    </Animated.View>
  );
};

export default RotatableIconWrapper;
