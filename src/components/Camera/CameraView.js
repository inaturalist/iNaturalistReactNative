// @flow
import React, { useRef, useState, useEffect } from "react";
import { StyleSheet, Animated } from "react-native";
import { Camera } from "react-native-vision-camera";
import type { Node } from "react";
import { useIsFocused } from "@react-navigation/native";
import { PinchGestureHandler, TapGestureHandler } from "react-native-gesture-handler";
import Reanimated, { Extrapolate, interpolate, useAnimatedGestureHandler, useAnimatedProps, useSharedValue } from "react-native-reanimated";

import FocusSquare from "./FocusSquare";
import { useIsForeground } from "./hooks/useIsForeground";

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
  const tapToFocusAnimation = useRef( new Animated.Value( 0 ) ).current;
  // check if camera page is active
  const isFocused = useIsFocused( );
  const isForeground = useIsForeground( );
  const isActive = isFocused && isForeground;

  const minZoom = device?.minZoom ?? 1;
  const maxZoom = Math.min( device?.maxZoom ?? 1, 5 );

  const cameraAnimatedProps = useAnimatedProps( () => {
    const z = Math.max( Math.min( zoom.value, maxZoom ), minZoom );
    return {
      zoom: z
    };
  }, [maxZoom, minZoom, zoom] );
  //#endregion

  //#region Pinch to Zoom Gesture
  // The gesture handler maps the linear pinch gesture (0 - 1) to an exponential curve since a camera's zoom
  // function does not appear linear to the user. (aka zoom 0.1 -> 0.2 does not look equal in difference as 0.8 -> 0.9)
  const onPinchGesture = useAnimatedGestureHandler( {
    onStart: ( _, context ) => {
      context.startZoom = zoom.value;
    },
    onActive: ( event, context ) => {
      // we're trying to map the scale gesture to a linear zoom here
      const startZoom = context.startZoom ?? 0;
      const scale = interpolate( event.scale, [1 - 1 / SCALE_FULL_ZOOM, 1, SCALE_FULL_ZOOM], [-1, 0, 1], Extrapolate.CLAMP );
      zoom.value = interpolate( scale, [-1, 0, 1], [minZoom, startZoom, maxZoom], Extrapolate.CLAMP );
    }
  } );
  //#endregion

  //#region Effects
  const neutralZoom = device?.neutralZoom ?? 1;
  useEffect( ( ) => {
    // Run everytime the neutralZoomScaled value changes. (reset zoom when device changes)
    zoom.value = neutralZoom;
  }, [neutralZoom, zoom] );

  const tapToFocus = async ( { nativeEvent } ) => {
    try {
      await camera.current.focus( { x: nativeEvent.x, y: nativeEvent.y } );
      tapToFocusAnimation.setValue( 1 );
      setTappedCoordinates( nativeEvent );
    } catch ( e ) {
      console.log( e, "couldn't tap to focus" );
    }
  };

  return (
    <>
      <PinchGestureHandler onGestureEvent={onPinchGesture} enabled={isActive}>
        <Reanimated.View style={StyleSheet.absoluteFill}>
          <TapGestureHandler onHandlerStateChange={tapToFocus} numberOfTaps={1}>
            <ReanimatedCamera
              ref={camera}
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={isActive}
              photo
              animatedProps={cameraAnimatedProps}
            />
          </TapGestureHandler>
        </Reanimated.View>
      </PinchGestureHandler>
      <FocusSquare
        tapToFocusAnimation={tapToFocusAnimation}
        tappedCoordinates={tappedCoordinates}
      />
    </>
  );
};

export default CameraView;
