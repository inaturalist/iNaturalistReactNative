import type { Coordinates } from "components/Camera/hooks/useFocusTap";
import { View } from "components/styledComponents";
import React from "react";
import type { AnimatedStyle } from "react-native-reanimated";
import Animated from "react-native-reanimated";
import colors from "styles/tailwindColors";

interface Props {
  animatedStyle: AnimatedStyle;
  tappedCoordinates: Coordinates | null;
}

// Inline style instead of className: reanimated's Animated.View isn't
// registered with nativewind 4, so className has no effect on it
const SQUARE_STYLE = {
  width: 66,
  height: 66,
  position: "absolute",
  borderWidth: 2,
  borderColor: colors.yellow,
  borderRadius: 1,
} as const;

const FocusSquare = ( { animatedStyle, tappedCoordinates }: Props ) => {
  if ( !tappedCoordinates ) { return null; }
  return (
    <Animated.View
      style={[SQUARE_STYLE, animatedStyle]}
    >
      <View className="absolute left-0 top-[30px] w-[5px] h-[2px] bg-yellow" />
      <View className="absolute left-[30px] top-0 w-[2px] h-[5px] bg-yellow" />
      <View className="absolute right-0 top-[30px] w-[5px] h-[2px] bg-yellow" />
      <View className="absolute left-[30px] bottom-0 w-[2px] h-[5px] bg-yellow" />
    </Animated.View>
  );
};

export default FocusSquare;
