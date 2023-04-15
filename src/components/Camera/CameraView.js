// @flow
import { useIsFocused } from "@react-navigation/native";
import type { Node } from "react";
import React, { useRef, useState } from "react";
import { Animated, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Reanimated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Camera } from "react-native-vision-camera";
import useIsForeground from "sharedHooks/useIsForeground";

import FocusSquare from "./FocusSquare";

// there are examples of zoom/tap gestures in the react-native-vision-camera library
// but they use an older version of react-native-gesture-handler
// https://github.com/mrousavy/react-native-vision-camera/blob/7335883969c9102b8a6d14ca7ed871f3de7e1389/example/src/CameraPage.tsx

const SCALE_MAX_ZOOM = 8;
const SCALE_MIN_ZOOM = 1;

const ReanimatedCamera = Reanimated.createAnimatedComponent( Camera );
Reanimated.addWhitelistedNativeProps( {
  zoom: true
} );

type Props = {
  camera: Object,
  device: Object,
  orientation: string
}

const CameraView = ( { camera, device, orientation }: Props ): Node => {
  const [tappedCoordinates, setTappedCoordinates] = useState( null );
  const singleTapToFocusAnimation = useRef( new Animated.Value( 0 ) ).current;
  // check if camera page is active
  const isFocused = useIsFocused( );
  const isForeground = useIsForeground( );
  const isActive = isFocused && isForeground;

  // used for pinch and double tap to zoom
  const [doubleTapping, setDoubleTapping] = useState( true );
  const scale = useSharedValue( SCALE_MIN_ZOOM );
  const savedScale = useSharedValue( SCALE_MIN_ZOOM );
  const animatedStyle = useAnimatedStyle( ( ) => ( {
    transform: [{
      scale: withTiming( scale.value, {
        duration: doubleTapping ? 300 : 0
      } )
    }]
  } ) );

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

  const doubleTapToZoom = ( ) => {
    if ( scale.value < SCALE_MAX_ZOOM ) {
      scale.value = Math.min( SCALE_MAX_ZOOM, scale.value += 1 );
    }
    savedScale.value = scale.value;
  };

  const singleTap = Gesture.Tap( )
    .runOnJS( true )
    .maxDuration( 250 )
    .numberOfTaps( 1 )
    .onStart( e => {
      singleTapToFocus( e );
    } );

  const doubleTap = Gesture.Tap( )
    .runOnJS( true )
    .maxDuration( 250 )
    .numberOfTaps( 2 )
    .onStart( ( ) => {
      setDoubleTapping( true );
      doubleTapToZoom( );
    } );

  const pinch = Gesture.Pinch( )
    .runOnJS( true )
    .withTestId( "PinchGestureHandler" )
    .requireExternalGestureToFail( singleTap, doubleTap )
    .onStart( ( ) => setDoubleTapping( false ) )
    .onUpdate( e => {
      const newValue = savedScale.value * e.scale;
      const minScaleValue = Math.max( SCALE_MIN_ZOOM, newValue );
      const maxScaleValue = Math.min( SCALE_MAX_ZOOM, newValue );

      if ( newValue > savedScale.value ) {
        scale.value = maxScaleValue;
      } else {
        scale.value = minScaleValue;
      }
    } )
    .onEnd( ( ) => {
      savedScale.value = scale.value;
    } );

  return (
    <>
      <GestureDetector gesture={Gesture.Exclusive( doubleTap, singleTap, pinch )}>
        <ReanimatedCamera
          ref={camera}
          style={[StyleSheet.absoluteFill, animatedStyle]}
          device={device}
          isActive={isActive}
          photo
          orientation={orientation}
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
