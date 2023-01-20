// @flow
import { useIsFocused } from "@react-navigation/native";
import type { Node } from "react";
import React, { useRef, useState } from "react";
import { Animated, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Reanimated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
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
  device: Object
}

const CameraView = ( { camera, device }: Props ): Node => {
  const [tappedCoordinates, setTappedCoordinates] = useState( null );
  const singleTapToFocusAnimation = useRef( new Animated.Value( 0 ) ).current;
  // check if camera page is active
  const isFocused = useIsFocused( );
  const isForeground = useIsForeground( );
  const isActive = isFocused && isForeground;

  // used for pinch and double tap to zoom
  const scale = useSharedValue( SCALE_MIN_ZOOM );
  const savedScale = useSharedValue( SCALE_MIN_ZOOM );
  const animatedStyle = useAnimatedStyle( ( ) => ( {
    transform: [{ scale: scale.value }]
  } ) );

  const singleTapToFocus = async event => {
    await camera.current.focus( { x: event.x, y: event.y } );
    singleTapToFocusAnimation.setValue( 1 );
    setTappedCoordinates( event );
  };

  const doubleTapToZoom = ( ) => {
    if ( scale.value < SCALE_MAX_ZOOM ) {
      scale.value = Math.min( SCALE_MAX_ZOOM, scale.value += 1 );
    }
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
      doubleTapToZoom( );
    } );

  const pinch = Gesture.Pinch( )
    .runOnJS( true )
    .withTestId( "PinchGestureHandler" )
    .requireExternalGestureToFail( singleTap, doubleTap )
    .onUpdate( e => {
      const minScaleValue = Math.max( SCALE_MIN_ZOOM, savedScale.value * e.scale );
      const maxScaleValue = Math.min( SCALE_MAX_ZOOM, savedScale.value * e.scale );
      const isZoomingIn = Math.sign( e.velocity ) >= 0;

      if ( isZoomingIn ) {
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
