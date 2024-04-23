import type { Node } from "react";
import {
  useCallback, useMemo, useRef, useState
} from "react";
import { Animated } from "react-native";
import { Gesture, GestureResponderEvent } from "react-native-gesture-handler";

const useFocusTap = ( cameraRef: Object, supportsFocus: boolean ): Node => {
  const [tappedCoordinates, setTappedCoordinates] = useState( null );
  const focusTapAnimation = useRef( new Animated.Value( 0 ) ).current;

  const onFocus = useCallback( async ( { x, y }: GestureResponderEvent ) => {
    // Show the focus square at the tapped coordinates even if we do not actually set the focus
    focusTapAnimation.setValue( 1 );
    setTappedCoordinates( { x, y } );
    // If the device doesn't support focus, we don't want the camera to focus
    if ( !supportsFocus ) { return; }
    try {
      await cameraRef.current.focus( { x, y } );
    } catch ( e ) {
      // Android often catches the following error from the Camera X library
      // but it doesn't seem to affect functionality, so we're ignoring this error
      // and throwing other errors
      const startFocusError = e?.message?.includes(
        "Cancelled by another startFocusAndMetering"
      );
      if ( !startFocusError ) {
        throw e;
      }
    }
  }, [
    cameraRef,
    supportsFocus,
    focusTapAnimation
  ] );

  const tapToFocus = useMemo( ( ) => Gesture.Tap( )
    .runOnJS( true )
    .onStart( onFocus ), [onFocus] );

  return {
    focusTapAnimation,
    tapToFocus,
    tappedCoordinates
  };
};

export default useFocusTap;
