import { Camera } from "components/Camera/helpers/visionCameraWrapper";
import React, {
  useCallback, useMemo, useRef, useState
} from "react";
import { Animated } from "react-native";
import {
  Gesture,
  GestureStateChangeEvent,
  TapGestureHandlerEventPayload
} from "react-native-gesture-handler";

const HALF_SIZE_FOCUS_BOX = 33;

interface Coordinates {
  x: number;
  y: number;
}

const useFocusTap = ( cameraRef: React.RefObject<Camera | null>, supportsFocus: boolean ) => {
  const [tappedCoordinates, setTappedCoordinates] = useState<Coordinates | null>( null );
  const focusOpacity = useRef( new Animated.Value( 0 ) ).current;

  const animatedStyle = useMemo( ( ) => {
    if ( !tappedCoordinates ) { return {}; }
    return ( {
      left: tappedCoordinates.x - HALF_SIZE_FOCUS_BOX,
      top: tappedCoordinates.y - HALF_SIZE_FOCUS_BOX,
      opacity: focusOpacity
    } );
  }, [tappedCoordinates, focusOpacity] );

  type TapEvent = GestureStateChangeEvent<TapGestureHandlerEventPayload>;
  const onFocus = useCallback( async ( { x, y }: TapEvent ) => {
    // If the device doesn't support focus, we don't want the camera to focus
    if ( supportsFocus ) {
      cameraRef?.current?.focus( { x, y } );
    }
    // Show the focus square at the tapped coordinates even if we do not actually set the focus
    focusOpacity.setValue( 1 );
    setTappedCoordinates( { x, y } );
    Animated.timing(
      focusOpacity,
      {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true
      }
    ).start( );
  }, [
    cameraRef,
    supportsFocus,
    focusOpacity
  ] );

  const tapToFocus = useMemo( ( ) => Gesture.Tap( )
    .runOnJS( true )
    .onStart( onFocus ), [onFocus] );

  return {
    animatedStyle,
    tapToFocus,
    tappedCoordinates
  };
};

export default useFocusTap;
