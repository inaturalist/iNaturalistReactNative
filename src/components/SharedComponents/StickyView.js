// @flow
import type { Node } from "react";
import React, { useEffect, useState } from "react";
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
  // eslint-disable-next-line no-unused-vars
  const [scrollPosition, setScrollPosition] = useState( 0 );

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

  useEffect( () => {
    const currentScrollY = scrollY.current;

    if ( scrollY.current ) {
      // #560 - We use a state variable to force rendering of the component - since on iOS,
      // you can over scroll a list when scrolling it to the top (creating a bounce effect),
      // and sometimes, even though offsetForHeader gets updated correctly, it doesn't cause
      // a re-render of the component, and then the Animated.View's translateY property doesn't
      // get updated with the latest value of offsetForHeader (this causes a weird view, where the
      // top header if semi cut off, even though the user scrolled the list all the way to the top).
      // So by changing a state variable of the component, every time the user scroll the list -> we
      // make sure the component always gets re-rendered.
      currentScrollY.addListener( ( { value } ) => {
        if ( value <= 0 ) {
          // Only force refresh of the state in case of an over-scroll (bounce effect)
          setScrollPosition( value );
        }
      } );
    }

    return () => {
      currentScrollY.removeAllListeners();
    };
  }, [scrollY] );

  const contentHeight = isTablet
    ? screenHeight
    : Math.max( screenWidth, screenHeight );

  return (
    <Animated.View
      style={[
        {
          transform: [{ translateY: offsetForHeader }],
          // Set the height to flow off screen so that when we translate the
          // view up, there's no gap at the bottom
          height: contentHeight + heightAboveView
        }
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default StickyView;
