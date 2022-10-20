// @flow strict-local

import type { Node } from "react";
import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";

type Props = {
  savingPhoto: boolean
}

const fade = value => ( {
  toValue: value,
  duration: 100,
  useNativeDriver: true
} );

const FadeInOutView = ( { savingPhoto }: Props ): Node => {
  const fadeAnimation = useRef( new Animated.Value( 0 ) ).current;

  useEffect( ( ) => {
    if ( savingPhoto ) {
      Animated.sequence( [
        Animated.timing( fadeAnimation, fade( 1 ) ),
        Animated.timing( fadeAnimation, fade( 0 ) )
      ] ).start( );
    }
  }, [savingPhoto, fadeAnimation] );

  return (
    <Animated.View
      style={{
        opacity: fadeAnimation
      }}
    />
  );
};

export default FadeInOutView;
