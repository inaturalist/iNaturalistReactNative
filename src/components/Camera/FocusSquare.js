// @flow

import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect } from "react";
import { Animated } from "react-native";

type Props = {
  tappedCoordinates: Object,
  singleTapToFocusAnimation: any
}

const FocusSquare = ( { tappedCoordinates, singleTapToFocusAnimation }: Props ): Node => {
  useEffect( ( ) => {
    if ( tappedCoordinates ) {
      Animated.timing(
        singleTapToFocusAnimation,
        {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true
        }
      ).start( );
    }
  }, [singleTapToFocusAnimation, tappedCoordinates] );

  if ( !tappedCoordinates ) { return null; }

  const HALF_SIZE_FOCUS_BOX = 33;

  return (
    // $FlowIgnore
    <Animated.View
      className="w-[66px] h-[66px] absolute border-2 border-yellow rounded-xs"
      style={[{
        left: tappedCoordinates.x - HALF_SIZE_FOCUS_BOX,
        top: tappedCoordinates.y - HALF_SIZE_FOCUS_BOX,
        opacity: singleTapToFocusAnimation
      }
      ]}
    >
      <View className="absolute left-0 top-[30px] w-[5px] h-[2px] bg-yellow" />
      <View className="absolute left-[30px] top-0 w-[2px] h-[5px] bg-yellow" />
      <View className="absolute right-0 top-[30px] w-[5px] h-[2px] bg-yellow" />
      <View className="absolute left-[30px] bottom-0 w-[2px] h-[5px] bg-yellow" />
    </Animated.View>
  );
};

export default FocusSquare;
