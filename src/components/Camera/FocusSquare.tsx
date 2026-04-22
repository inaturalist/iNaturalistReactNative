import type { Coordinates } from "components/Camera/hooks/useFocusTap";
import { View } from "components/styledComponents";
import React from "react";
import type { AnimatedStyle } from "react-native-reanimated";
import Animated from "react-native-reanimated";

interface Props {
  animatedStyle: AnimatedStyle;
  tappedCoordinates: Coordinates | null;
}

const FocusSquare = ( { animatedStyle, tappedCoordinates }: Props ) => {
  if ( !tappedCoordinates ) { return null; }
  return (
    <Animated.View
      className="w-[66px] h-[66px] absolute border-2 border-yellow rounded-xs"
      style={animatedStyle}
    >
      <View className="absolute left-0 top-[30px] w-[5px] h-[2px] bg-yellow" />
      <View className="absolute left-[30px] top-0 w-[2px] h-[5px] bg-yellow" />
      <View className="absolute right-0 top-[30px] w-[5px] h-[2px] bg-yellow" />
      <View className="absolute left-[30px] bottom-0 w-[2px] h-[5px] bg-yellow" />
    </Animated.View>
  );
};

export default FocusSquare;
