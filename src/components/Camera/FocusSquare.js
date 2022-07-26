// @flow

import type { Node } from "react";
import React, { useEffect } from "react";
import { Animated } from "react-native";

import { viewStyles } from "../../styles/camera/standardCamera";

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
    <Animated.View
      style={[{
        left: tappedCoordinates.x,
        top: tappedCoordinates.y,
        opacity: tapToFocusAnimation
      }, viewStyles.tapToFocusSquare
      ]}
    />
  );
};

export default FocusSquare;
