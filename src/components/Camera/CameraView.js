// @flow
import { useIsFocused } from "@react-navigation/native";
import type { Node } from "react";
import React, {
  useEffect, useRef, useState
} from "react";
import { Animated, StyleSheet } from "react-native";
import {
  Gesture, GestureDetector, PinchGestureHandler
} from "react-native-gesture-handler";
import Reanimated, {
  Extrapolate, interpolate,
  useAnimatedGestureHandler, useAnimatedProps,
  useSharedValue
} from "react-native-reanimated";
import { Camera } from "react-native-vision-camera";
import useIsForeground from "sharedHooks/useIsForeground";

import FocusSquare from "./FocusSquare";

// a lot of the camera functionality (pinch to zoom, etc.) is lifted from the example library:
// https://github.com/mrousavy/react-native-vision-camera/blob/7335883969c9102b8a6d14ca7ed871f3de7e1389/example/src/CameraPage.tsx

const SCALE_FULL_ZOOM = 3;

const ReanimatedCamera = Reanimated.createAnimatedComponent( Camera );
Reanimated.addWhitelistedNativeProps( {
  zoom: true
} );

type Props = {
  camera: Object,
  device: Object
}

const CameraView = ( { camera, device }: Props ): Node => {
  const zoom = useSharedValue( 0 );
  const [tappedCoordinates, setTappedCoordinates] = useState( null );
  const singleTapToFocusAnimation = useRef( new Animated.Value( 0 ) ).current;
  // check if camera page is active
  const isFocused = useIsFocused( );
  const isForeground = useIsForeground( );
  const isActive = isFocused && isForeground;

  const minZoom = device?.minZoom ?? 1;
  const maxZoom = Math.min( device?.maxZoom ?? 1, 5 );

  const cameraAnimatedProps = useAnimatedProps( ( ) => {
    const z = Math.max( Math.min( zoom.value, maxZoom ), minZoom );
    return {
      zoom: z
    };
  }, [maxZoom, minZoom, zoom] );
  // #endregion

  // #region Pinch to Zoom Gesture
  // The gesture handler maps the linear pinch gesture (0 - 1) to an
  // exponential curve since a camera's zoom function does not appear linear
  // to the user. (aka zoom 0.1 -> 0.2 does not look equal in difference as
  // 0.8 -> 0.9)
  const onPinchGesture = useAnimatedGestureHandler( {
    onStart: ( _, context ) => {
      context.startZoom = zoom.value;
    },
    onActive: ( event, context ) => {
      // we're trying to map the scale gesture to a linear zoom here
      const startZoom = context.startZoom ?? 0;
      const scale = interpolate(
        event.scale,
        [1 - 1 / SCALE_FULL_ZOOM, 1, SCALE_FULL_ZOOM],
        [-1, 0, 1],
        Extrapolate.CLAMP
      );
      zoom.value = interpolate(
        scale,
        [-1, 0, 1],
        [minZoom, startZoom, maxZoom],
        Extrapolate.CLAMP
      );
    }
  } );
  // #endregion

  // #region Effects
  const neutralZoom = device?.neutralZoom ?? 1;
  useEffect( ( ) => {
    // Run everytime the neutralZoomScaled value changes. (reset zoom when device changes)
    zoom.value = neutralZoom;
  }, [neutralZoom, zoom] );

  const singleTapToFocus = async event => {
    await camera.current.focus( { x: event.x, y: event.y } );
    singleTapToFocusAnimation.setValue( 1 );
    setTappedCoordinates( event );
  };

  const doubleTapToZoom = ( ) => {
    if ( zoom.value < SCALE_FULL_ZOOM ) {
      zoom.value += 1;
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

  return (
    <>
      <PinchGestureHandler onGestureEvent={onPinchGesture} enabled={isActive}>
        <Reanimated.View style={StyleSheet.absoluteFill}>
          <GestureDetector gesture={Gesture.Exclusive( doubleTap, singleTap )}>
            <ReanimatedCamera
              ref={camera}
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={isActive}
              photo
              animatedProps={cameraAnimatedProps}
            />
          </GestureDetector>
        </Reanimated.View>
      </PinchGestureHandler>
      <FocusSquare
        singleTapToFocusAnimation={singleTapToFocusAnimation}
        tappedCoordinates={tappedCoordinates}
      />
    </>
  );
};

export default CameraView;
