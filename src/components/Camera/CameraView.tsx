import { useAppState } from "@react-native-community/hooks";
import { useIsFocused } from "@react-navigation/native";
import useFocusTap from "components/Camera/hooks/useFocusTap.ts";
import React, {
  useCallback
} from "react";
import { Platform, StyleSheet } from "react-native";
import {
  Gesture, GestureDetector
} from "react-native-gesture-handler";
import Reanimated from "react-native-reanimated";
import type { CameraDevice, CameraProps, CameraRuntimeError } from "react-native-vision-camera";
import { Camera, useCameraFormat } from "react-native-vision-camera";

import FocusSquare from "./FocusSquare";

const ReanimatedCamera = Reanimated.createAnimatedComponent( Camera );
Reanimated.addWhitelistedNativeProps( {
  zoom: true
} );

interface Props {
  animatedProps: CameraProps,
  cameraRef: React.RefObject<Camera>,
  device: CameraDevice,
  frameProcessor?: Function,
  onCameraError?: Function,
  onCaptureError?: Function,
  onClassifierError?: Function,
  onDeviceNotSupported?: Function,
  pinchToZoom?: Function,
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
  pinchToZoom,
  resizeMode
}: Props ) => {
  const {
    animatedStyle,
    tapToFocus
  } = useFocusTap( cameraRef, device.supportsFocus );

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

      // If it is a "device/" error, return the error code
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

  // Note that overflow-hidden handles what seems to be a bug in android in
  // which the Camera overflows its view
  return (
    <>
      <GestureDetector
        gesture={Gesture.Simultaneous( tapToFocus, pinchToZoom )}
        className="overflow-hidden"
      >
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
          photo
          photoQualityBalance="quality"
          outputOrientation="device"
          pixelFormat="yuv"
          resizeMode={resizeMode || "cover"}
          style={StyleSheet.absoluteFill}

        />
      </GestureDetector>
      <FocusSquare
        animatedStyle={animatedStyle}
      />
    </>

  );
};

export default CameraView;
