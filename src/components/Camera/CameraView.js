// @flow
import { useIsFocused } from "@react-navigation/native";
import type { Node } from "react";
import React, { useRef, useState } from "react";
import { Animated, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
// $FlowFixMe
import { Camera } from "react-native-vision-camera"; // eslint-disable-line import/no-unresolved
import useIsForeground from "sharedHooks/useIsForeground";

import FocusSquare from "./FocusSquare";

export const PORTRAIT = "portrait";
export const LANDSCAPE_LEFT = "landscapeLeft";
export const LANDSCAPE_RIGHT = "landscapeRight";

type Props = {
  camera: Object,
  device: Object
}

const CameraView = ( { camera, device }: Props ): Node => {
  const [tappedCoordinates, setTappedCoordinates] = useState( null );
  const singleTapToFocusAnimation = useRef( new Animated.Value( 0 ) ).current;

  // check if camera page is active
  const isFocused = useIsFocused( );
  const isForeground = useIsForeground( );
  const isActive = isFocused && isForeground;

  const singleTapToFocus = async ( { x, y } ) => {
    // If the device doesn't support focus, we don't want to do anything and show no animation
    if ( !device.supportsFocus ) {
      return;
    }
    try {
      singleTapToFocusAnimation.setValue( 1 );
      setTappedCoordinates( { x, y } );
      await camera.current.focus( { x, y } );
    } catch ( e ) {
      // Android often catches the following error from the Camera X library
      // but it doesn't seem to affect functionality, so we're ignoring this error
      // and throwing other errors
      const startFocusError = e?.message?.includes( "Cancelled by another startFocusAndMetering" );
      if ( !startFocusError ) {
        throw e;
      }
    }
  };

  const singleTap = Gesture.Tap( )
    .runOnJS( true )
    .maxDuration( 250 )
    .numberOfTaps( 1 )
    .onStart( e => {
      singleTapToFocus( e );
    } );

  return (
    <>
      <GestureDetector gesture={Gesture.Exclusive( singleTap )}>
        <Camera
          ref={camera}
          style={[
            StyleSheet.absoluteFill
          ]}
          device={device}
          isActive={isActive}
          photo
          enableZoomGesture
        />
      </GestureDetector>
      <FocusSquare
        singleTapToFocusAnimation={singleTapToFocusAnimation}
        tappedCoordinates={tappedCoordinates}
      />
    </>
  );
};

export default CameraView;
