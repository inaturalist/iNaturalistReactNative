import { View } from "components/styledComponents";
import _ from "lodash";
import React from "react";
import { Animated } from "react-native";

interface Props {
  animatedStyle: object
}

const FocusSquare = ( { animatedStyle }: Props ) => {
  if ( _.isEmpty( animatedStyle ) ) { return null; }
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
