import { useAppState } from "@react-native-community/hooks";
import { useIsFocused } from "@react-navigation/native";
import VeryBadIpadRotator from "components/SharedComponents/VeryBadIpadRotator";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback, useRef, useState } from "react";
import { Animated, Platform, StyleSheet } from "react-native";
import {
  Gesture, GestureDetector
} from "react-native-gesture-handler";
import Reanimated from "react-native-reanimated";
import type { CameraProps, CameraRuntimeError } from "react-native-vision-camera";
import { Camera, useCameraFormat } from "react-native-vision-camera";
import { orientationPatch } from "sharedHelpers/visionCameraPatches";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation";

import FocusSquare from "./FocusSquare";

const ReanimatedCamera = Reanimated.createAnimatedComponent( Camera );
Reanimated.addWhitelistedNativeProps( {
  zoom: true
} );

interface Props {
  animatedProps: CameraProps,
  cameraRef: Object,
  device: Object,
  frameProcessor?: Function,
  onCameraError?: Function,
  onCaptureError?: Function,
  onClassifierError?: Function,
  onDeviceNotSupported?: Function,
  onZoomChange?: Function,
  onZoomStart?: Function,
  resizeMode?: string
}

// A container for the Camera component
// that has logic that applies to both use cases in StandardCamera and AICamera
const CameraView = ( {
  animatedProps,
  cameraRef,
  device,
  frameProcessor,
  onCameraError,
  onCaptureError,
  onClassifierError,
  onDeviceNotSupported,
  onZoomChange,
  onZoomStart,
  resizeMode
}: Props ): Node => {
  const [focusAvailable, setFocusAvailable] = useState( true );
  const [tappedCoordinates, setTappedCoordinates] = useState( null );
  const singleTapToFocusAnimation = useRef( new Animated.Value( 0 ) ).current;

  // check if camera page is active
  const isFocused = useIsFocused( );
  const appState = useAppState( );
  const isActive = isFocused && appState === "active";

  // Select a format that provides the highest resolution for photos and videos
  const iosFormat = useCameraFormat( device, [
    { photoResolution: "max" },
    { videoResolution: "max" }
  ] );
  const format = Platform.OS === "ios"
    ? iosFormat
    : undefined;
  // Set the exposure to the middle of the min and max exposure
  const exposure = ( device.maxExposure + device.minExposure ) / 2;

  const { deviceOrientation } = useDeviceOrientation();

  const singleTapToFocus = async ( { x, y } ) => {
    // Show the focus square at the tapped coordinates even if we do not actually set the focus
    singleTapToFocusAnimation.setValue( 1 );
    setTappedCoordinates( { x, y } );
    // If the device doesn't support focus, we don't want the camera to focus
    if ( !device.supportsFocus && focusAvailable ) {
      return;
    }
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
  };

  const singleTap = Gesture.Tap()
    .runOnJS( true )
    .maxDuration( 250 )
    .numberOfTaps( 1 )
    .onStart( e => singleTapToFocus( e ) );

  const onError = useCallback(
    ( error: CameraRuntimeError ) => {
      // { code: string, message: string, cause?: {} }
      console.log( "error", error );
      // If there is no error code, log the error
      // and return because we don't know what to do with it
      if ( !error.code ) {
        console.log( "Camera runtime error without error code:" );
        console.log( "error", error );
        return;
      }

      // If the error code is "device/focus-not-supported" disable focus
      if ( error.code === "device/focus-not-supported" ) {
        setFocusAvailable( false );
        return;
      }
      // If it is any other "device/" error, return the error code
      if ( error.code.includes( "device/" ) ) {
        console.log( "error :>> ", error );
        onDeviceNotSupported( error.code );
        return;
      }

      if ( error.code.includes( "capture/" ) ) {
        console.log( "error :>> ", error );
        onCaptureError( error.code );
        return;
      }

      // If the error code is "frame-processor/unavailable" handle the error as classifier error
      if ( error.code === "frame-processor/unavailable" ) {
        onClassifierError( error );
        return;
      }

      if ( error.code.includes( "permission/" ) ) {
        console.log( "error :>> ", error );
        if ( error.code === "permission/camera-permission-denied" ) {
          // No camera permission
          // In Seek we do not have a PermissionGate wrapper component,
          // so we need to handle this error there.
          // Here we can just log it for now, it should in principle never be hit,
          // because if we don't have permission the screen is not shown.
          return;
        }
      }
      onCameraError( error.code );
    },
    [
      onClassifierError,
      onDeviceNotSupported,
      onCaptureError,
      onCameraError
    ]
  );

  const pinchGesture = Gesture.Pinch()
    .runOnJS( true )
    .onStart( _ => {
      onZoomStart?.();
    } ).onChange( e => {
      onZoomChange?.( e.scale );
    } );

  // react-native-vision-camera v3.9.0:
  // iPad camera preview is wrong in anything else than portrait, hence the
  // VeryBadIpadRotator, which will rotate its contents us a style transform
  // and adjust position accordingly

  // Note that overflow-hidden handles what seems to be a bug in android in
  // which the Camera overflows its view
  return (
    <View className="overflow-hidden flex-1">
      <VeryBadIpadRotator>
        <GestureDetector gesture={Gesture.Exclusive( singleTap, pinchGesture )}>
          <ReanimatedCamera
            // Shared props between StandardCamera and AICamera
            ref={cameraRef}
            animatedProps={animatedProps}
            device={device}
            enableZoomGesture={false}
            exposure={exposure}
            format={format}
            frameProcessor={frameProcessor}
            isActive={isActive}
            onError={onError}
            // react-native-vision-camera v3.9.0: This prop is undocumented, but does work on iOS
            // it does nothing on Android so we set it to null there
            orientation={orientationPatch( deviceOrientation )}
            photo
            photoQualityBalance="quality"
            pixelFormat="yuv"
            resizeMode={resizeMode || "cover"}
            style={StyleSheet.absoluteFill}

          />
        </GestureDetector>
        <FocusSquare
          singleTapToFocusAnimation={singleTapToFocusAnimation}
          tappedCoordinates={tappedCoordinates}
        />
      </VeryBadIpadRotator>
    </View>
  );
};

export default CameraView;
