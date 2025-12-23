import classNames from "classnames";
import { View } from "components/styledComponents";
import type { PropsWithChildren } from "react";
import React, { useEffect, useMemo, useState } from "react";
import { Animated, Keyboard } from "react-native";
import { getShadow } from "styles/global";

const DROP_SHADOW = getShadow( {
  offsetHeight: 4,
  shadowOpacity: 0.4,
  shadowRadius: 8,
} );

const BOTTOM_ANIMATION_START = 100;
const TOP_ANIMATION_START = -100;

const FOOTER_PADDING = 17;

interface Props extends PropsWithChildren {
  position: "topStart" | "topEnd" | "bottomStart" | "bottomEnd";
  containerClass?: string;
  endY?: number | null;
  show: boolean;
  footerHeight: number;
}

// Ensure this component is placed outside of scroll views

const FloatingActionBar = ( {
  position = "bottomEnd",
  endY = null,
  containerClass,
  children,
  show,
  footerHeight: FOOTER_HEIGHT,
}: Props ) => {
  const bottomPosition = FOOTER_HEIGHT + FOOTER_PADDING;
  const [keyboardHeight, setKeyboardHeight] = useState( 0 );
  const [keyboardOpen, setKeyboardOpen] = useState( false );
  const isBottom = position === "bottomEnd" || position === "bottomStart";
  const start = isBottom
    ? BOTTOM_ANIMATION_START + bottomPosition
    : TOP_ANIMATION_START;
  const animate = useMemo(
    () => new Animated.Value( show
      ? start
      : 0 ),
    [start, show],
  );

  useEffect( () => {
    const showSubscription = Keyboard.addListener(
      "keyboardDidShow",
      event => {
        setKeyboardHeight( event.endCoordinates.height );
        setKeyboardOpen( true );
      },
    );
    const hideSubscription = Keyboard.addListener( "keyboardDidHide", () => {
      setKeyboardOpen( false );
    } );

    return () => {
      showSubscription?.remove( );
      hideSubscription?.remove( );
    };
  }, [] );

  useEffect( () => {
    const sharedParams = {
      velocity: 1,
      tension: 2,
      friction: 8,
      useNativeDriver: true,
    };

    const toValue = show
      ? 0
      : start;

    Animated.spring( animate, {
      ...sharedParams,
      toValue,
    } ).start();
  }, [keyboardOpen, keyboardHeight, position, show, animate, start] );

  const effectiveKeyboardHeight = keyboardOpen
    ? keyboardHeight
    : 0;

  const positionStyle: {
    bottom?: number;
    right?: number;
  } = {};

  if ( position.includes( "bottom" ) ) {
    positionStyle.bottom = ( endY ?? bottomPosition ) + effectiveKeyboardHeight;
  }

  if ( position.includes( "End" ) ) {
    positionStyle.right = 0;
  }

  return (
    <Animated.View
      /* eslint-disable-next-line react-native/no-inline-styles */
      style={{
        overflow: "visible",
        position: "absolute",
        zIndex: 40,
        transform: [{ translateY: animate }],
        ...positionStyle,
      }}
    >
      <View
        className={classNames( "bg-white", containerClass )}
        style={DROP_SHADOW}
      >
        {children}
      </View>
    </Animated.View>
  );
};

export default FloatingActionBar;
