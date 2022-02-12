// @flow

import React, { useEffect } from "react";
import { View, Animated } from "react-native";
import type { Node } from "react";

import { viewStyles } from "../../styles/camera/normalCamera";

type Props = {
  tappedCoordinates: Object,
  tapToFocusAnimation: any
}

const FocusSquare = ( { tappedCoordinates, tapToFocusAnimation }: Props ): Node => {
  useEffect( ( ) => {
    if ( tappedCoordinates ) {
      Animated.timing(
        tapToFocusAnimation,
        {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true
        }
      ).start( );
    }
  }, [tapToFocusAnimation, tappedCoordinates] );

  if ( !tappedCoordinates ) { return null; }

  return (
    <Animated.View style={{ opacity: tapToFocusAnimation }}>
      <View style={[
        viewStyles.tapToFocusSquare,
        {
          left: tappedCoordinates.x,
          top: tappedCoordinates.y
        }
      ]} />
    </Animated.View>
  );
};

export default FocusSquare;
