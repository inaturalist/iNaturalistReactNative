// @flow
import classNames from "classnames";
import { View } from "components/styledComponents";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Animated, Keyboard } from "react-native";
import { useTheme } from "react-native-paper";
import { getShadowStyle } from "styles/global";

const getShadow = shadowColor => getShadowStyle( {
  shadowColor,
  offsetWidth: 0,
  offsetHeight: 4,
  shadowOpacity: 0.4,
  shadowRadius: 4,
  elevation: 5
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
  const theme = useTheme();
  const [keyboardHeight, setKeyboardHeight] = useState( 0 );
  const [keyboardOpen, setKeyboardOpen] = useState( false );
  const isBottom = position === "bottomEnd" || position === "bottomStart";
  const start = isBottom ? 100 : -100;
  const animateIn = useMemo( () => new Animated.Value( start ), [start] );
  const animateOut = useMemo( () => new Animated.Value( 0 ), [] );

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
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [] );

  useEffect( () => {
    const sharedParams = {
      velocity: 1,
      tension: 2,
      friction: 8,
      useNativeDriver: true
    };

    if ( show ) {
      Animated.spring( animateIn, {
        ...sharedParams,
        toValue: 0
      } ).start();
    } else {
      Animated.spring( animateOut, {
        ...sharedParams,
        toValue: start
      } ).start();
    }
  }, [
    keyboardOpen,
    keyboardHeight,
    position,
    show,
    animateIn,
    animateOut,
    start
  ] );

  const effectiveKeyboardHeight = keyboardOpen ? keyboardHeight : 0;

  return (
    <Animated.View
      /* eslint-disable-next-line react-native/no-inline-styles */
      style={{
        position: "absolute",
        zIndex: 50,
        transform: [{ translateY: show ? animateIn : animateOut }],
        ...( position === "bottomEnd" || position === "bottomStart"
          ? { bottom: ( endY ?? 0 ) + effectiveKeyboardHeight }
          : {} ),
        ...( position === "bottomEnd" || position === "topEnd"
          ? { right: 0 }
          : {} ),
        ...getShadow( theme.colors.primary )
      }}
    >
      <View className={classNames( "bg-white", containerClass )}>{children}</View>
    </Animated.View>
  );
};

export default FloatingActionBar;
