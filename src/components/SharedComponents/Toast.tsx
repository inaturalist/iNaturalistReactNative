import Heading5 from "components/SharedComponents/Typography/Heading5";
import { Pressable } from "components/styledComponents";
import React, { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated } from "react-native";

const FADE_IN_DURATION = 150;
const VISIBLE_DURATION = 1500;
const FADE_OUT_DURATION = 300;

interface Props {
  onHide: ( ) => void;
  testID?: string;
  text: string;
}

const Toast = ( {
  onHide, testID, text,
}: Props ) => {
  const [opacity] = useState( ( ) => new Animated.Value( 0 ) );
  const onHideRef = useRef( onHide );

  useEffect( ( ) => {
    onHideRef.current = onHide;
  }, [onHide] );

  useEffect( ( ) => {
    AccessibilityInfo.announceForAccessibility( text );
    opacity.setValue( 0 );

    const animation = Animated.sequence( [
      Animated.timing( opacity, {
        toValue: 1,
        duration: FADE_IN_DURATION,
        useNativeDriver: true,
      } ),
      Animated.delay( VISIBLE_DURATION ),
      Animated.timing( opacity, {
        toValue: 0,
        duration: FADE_OUT_DURATION,
        useNativeDriver: true,
      } ),
    ] );

    animation.start( ( { finished } ) => {
      if ( finished ) { onHideRef.current( ); }
    } );

    return ( ) => animation.stop( );
  }, [opacity, text] );

  // inline style for opacity instead of className: Animated.View doesn't like className
  return (
    <Animated.View
      pointerEvents="box-none"
      style={{ opacity }}
    >
      <Pressable
        accessibilityLabel={text}
        accessibilityRole="button"
        className="bg-white rounded-lg px-[10px] py-2"
        onPress={onHide}
        testID={testID}
      >
        <Heading5 className="text-darkGray text-center">{text}</Heading5>
      </Pressable>
    </Animated.View>
  );
};

export default Toast;
