// @flow
import type { Node } from "react";
import React from "react";
import { Animated } from "react-native";
import { useDeviceOrientation } from "sharedHooks";

const { diffClamp } = Animated;

type Props = {
  children: any,
  scrollY: any,
  heightAboveView: number
};

const StickyView = ( {
  children,
  scrollY,
  heightAboveView
}: Props ): Node => {
  const {
    isTablet,
    screenHeight,
    screenWidth
  } = useDeviceOrientation( );

  // On Android, the scroll view offset is a double (not an integer), and interpolation shouldn't be
  // one-to-one, which causes a jittery header while slow scrolling (see issue #634).
  // See here as well: https://stackoverflow.com/a/60898411/1233767
  const scrollYClamped = diffClamp(
    scrollY.current,
    0,
    heightAboveView * 2
  );

  // Same as comment above (see here: https://stackoverflow.com/a/60898411/1233767)
  const offsetForHeader = scrollYClamped.interpolate( {
    inputRange: [0, heightAboveView * 2],
    // $FlowIgnore
    outputRange: [0, -heightAboveView]
  } );

  return (
    <Animated.View
      style={[
        {
          transform: [{ translateY: offsetForHeader }],
          height: isTablet
            ? screenHeight
            : Math.max( screenWidth, screenHeight )
        }
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default StickyView;
