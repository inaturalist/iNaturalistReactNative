// @flow
import classNames from "classnames";
import { View } from "components/styledComponents";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Animated, Keyboard } from "react-native";
import { getShadow } from "styles/global";

const DROP_SHADOW = getShadow( {
  offsetHeight: 4,
  shadowOpacity: 0.4,
  shadowRadius: 8
} );

type Props = {
  position: "topStart" | "topEnd" | "bottomStart" | "bottomEnd",
  containerClass?: string,
  endY?: number | null,
  children: React.Node,
  show: boolean,
};

// Ensure this component is placed outside of scroll views

const FloatingActionBar = ( {
  position = "bottomEnd",
  endY = null,
  containerClass,
  children,
  show
}: Props ): React.Node => {
  const [keyboardHeight, setKeyboardHeight] = useState( 0 );
  const [keyboardOpen, setKeyboardOpen] = useState( false );
  const isBottom = position === "bottomEnd" || position === "bottomStart";
  const start = isBottom
    ? 100
    : -100;
  const animate = useMemo(
    () => new Animated.Value( show
      ? start
      : 0 ),
    [start, show]
  );

  useEffect( () => {
    const showSubscription = Keyboard.addListener(
      "keyboardDidShow",
      event => {
        setKeyboardHeight( event.endCoordinates.height );
        setKeyboardOpen( true );
      }
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
      useNativeDriver: true
    };

    const toValue = show
      ? 0
      : start;

    Animated.spring( animate, {
      ...sharedParams,
      toValue
    } ).start();
  }, [keyboardOpen, keyboardHeight, position, show, animate, start] );

  const effectiveKeyboardHeight = keyboardOpen
    ? keyboardHeight
    : 0;

  const positionStyle = {};

  if ( position.includes( "bottom" ) ) {
    positionStyle.bottom = ( endY ?? 0 ) + effectiveKeyboardHeight;
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
        ...positionStyle
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
