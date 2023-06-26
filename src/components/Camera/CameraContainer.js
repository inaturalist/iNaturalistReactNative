import { useIsFocused } from "@react-navigation/native";
import type { Node } from "react";
import React, { useCallback, useRef, useState } from "react";
import { Animated, Platform, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation";
import useIsForeground from "sharedHooks/useIsForeground";

import FocusSquare from "./FocusSquare";

type Props = {
  cameraComponent: Function,
  cameraRef: Object,
  device: Object,
};

// A container for the Camera component
// that has logic that applies to both use cases in StandardCamera and ARCamera
const CameraContainer = ( {
  cameraComponent,
  cameraRef,
  device,
}: Props ): Node => {
  const [tappedCoordinates, setTappedCoordinates] = useState( null );
  const singleTapToFocusAnimation = useRef( new Animated.Value( 0 ) ).current;

  // check if camera page is active
  const isFocused = useIsFocused();
  const isForeground = useIsForeground();
  const isActive = isFocused && isForeground;

  const { deviceOrientation } = useDeviceOrientation();

  const singleTapToFocus = async ( { x, y } ) => {
    // If the device doesn't support focus, we don't want to do anything and show no animation
    if ( !device.supportsFocus && focusAvailable ) {
      return;
    }
    try {
      singleTapToFocusAnimation.setValue( 1 );
      setTappedCoordinates( { x, y } );
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
  };

  const singleTap = Gesture.Tap()
    .runOnJS( true )
    .maxDuration( 250 )
    .numberOfTaps( 1 )
    .onStart( e => singleTapToFocus( e ) );

  return (
    <>
      <GestureDetector gesture={Gesture.Exclusive( singleTap )}>
        {cameraComponent( {
          // Shared props between Camera (used in StandardCamera)
          // and FrameProcessorCamera (used in ARCamera)
          photo: true,
          enableZoomGesture: true,
          isActive,
          style: [StyleSheet.absoluteFill],
          // In Android the camera won't set the orientation metadata
          // correctly without this, but in iOS it won't display the
          // preview correctly *with* it
          orientation: Platform.OS === "android"
            ? deviceOrientation
            : null,
          // Props specificaly set
          ref: cameraRef,
          device,
        } )}
      </GestureDetector>
      <FocusSquare
        singleTapToFocusAnimation={singleTapToFocusAnimation}
        tappedCoordinates={tappedCoordinates}
      />
    </>
  );
};

export default CameraContainer;
