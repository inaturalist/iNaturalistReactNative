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

const RotatableIconWrapper = ( {
  children,
  rotatableAnimatedStyle,
  containerClass,
}: Props ) => {
  if ( isTablet || !rotatableAnimatedStyle ) {
    return (
      <View className={containerClass}>
        {children}
      </View>
    );
  }

  // className on the plain View, animation inside: reanimated's Animated.View
  // isn't registered with nativewind 4, so className has no effect on it
  return (
    <View className={containerClass}>
      <Animated.View style={rotatableAnimatedStyle}>
        {children}
      </Animated.View>
    </View>
  );
};

export default RotatableIconWrapper;
