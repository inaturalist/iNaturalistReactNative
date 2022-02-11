// @flow

import React, { useRef, useState, useEffect } from "react";
import { Text, StyleSheet, View, Pressable } from "react-native";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import type { Node } from "react";
import { PinchGestureHandler, PinchGestureHandlerGestureEvent, TapGestureHandler } from "react-native-gesture-handler";
import Reanimated, { Extrapolate, interpolate, useAnimatedGestureHandler, useAnimatedProps, useSharedValue } from "react-native-reanimated";
import { useIsFocused } from "@react-navigation/core";

import { viewStyles } from "../../styles/camera/normalCamera";
import { useIsForeground } from "./hooks/useIsForeground";

const SCALE_FULL_ZOOM = 3;

const ReanimatedCamera = Reanimated.createAnimatedComponent( Camera );
Reanimated.addWhitelistedNativeProps( {
  zoom: true
} );

const NormalCamera = ( ): Node => {
  // $FlowFixMe
  const camera = useRef<Camera>( null );
  const [cameraPosition, setCameraPosition] = useState( "back" );
  const devices = useCameraDevices( "wide-angle-camera" );
  const device = devices[cameraPosition];
  const [takePhotoOptions, setTakePhotoOptions] = useState( {
    flash: "off"
  } );
  const zoom = useSharedValue( 0 );

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

  // select different devices
  // front or back camera
  // tap to focus
  // zoom in

  const takePhoto = async ( ) => {
    try {
      const photo = await camera.current.takePhoto( takePhotoOptions );
      console.log( photo, "photo" );
    } catch ( e ) {
      console.log( e, "couldn't take photo" );
    }
  };

  const toggleFlash = ( ) => {
    setTakePhotoOptions( {
      ...takePhotoOptions,
      flash: takePhotoOptions.flash === "on" ? "off" : "on"
    } );
  };

  const flipCamera = ( ) => {
    const newPosition = cameraPosition === "back" ? "front" : "back";
    setCameraPosition( newPosition );
  };

    //#region Effects
    const neutralZoom = device?.neutralZoom ?? 1;
    useEffect( () => {
      // Run everytime the neutralZoomScaled value changes. (reset zoom when device changes)
      zoom.value = neutralZoom;
    }, [neutralZoom, zoom] );

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

  // TODO: add Android permissions
  if ( device == null ) { return null;}
  return (
    <View style={viewStyles.container}>
      {device !== null && (
        <PinchGestureHandler onGestureEvent={onPinchGesture} enabled={isActive}>
          <Reanimated.View style={StyleSheet.absoluteFill}>
          <ReanimatedCamera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive
            photo
            animatedProps={cameraAnimatedProps}
          />
          </Reanimated.View>
        </PinchGestureHandler>
      )}
      <Pressable
        style={viewStyles.flashButton}
        onPress={toggleFlash}
      >
          <Text>flash</Text>
      </Pressable>
      <Pressable
        style={viewStyles.captureButton}
        onPress={takePhoto}
      >
          <Text>camera capture</Text>
      </Pressable>
      <Pressable
        style={viewStyles.cameraFlipButton}
        onPress={flipCamera}
      >
          <Text>flip camera</Text>
      </Pressable>
    </View>
  );
};

export default NormalCamera;
