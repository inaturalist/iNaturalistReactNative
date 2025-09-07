import { useAppState } from "@react-native-community/hooks";
import { useIsFocused } from "@react-navigation/native";
import {
  Camera,
  useCameraFormat
} from "components/Camera/helpers/visionCameraWrapper";
import useFocusTap from "components/Camera/hooks/useFocusTap";
import React, {
  useCallback
} from "react";
import {
  Dimensions, Platform, StyleSheet
} from "react-native";
import {
  Gesture,
  GestureDetector,
  PanGesture,
  PinchGesture
} from "react-native-gesture-handler";
import Reanimated from "react-native-reanimated";
import type {
  CameraDevice, CameraDeviceFormat, CameraProps, CameraRuntimeError
} from "react-native-vision-camera";

import FocusSquare from "./FocusSquare";

const ReanimatedCamera = Reanimated.createAnimatedComponent( Camera );
Reanimated.addWhitelistedNativeProps( {
  zoom: true
} );

interface Props {
  animatedProps: CameraProps,
  cameraRef: React.RefObject<Camera | null>,
  cameraScreen: "standard" | "ai",
  debugFormat: CameraDeviceFormat | undefined,
  device: CameraDevice,
  frameProcessor?: () => void,
  onCameraError: ( error: CameraRuntimeError ) => void,
  onCaptureError: ( error: CameraRuntimeError ) => void,
  onClassifierError: ( error: CameraRuntimeError ) => void,
  onDeviceNotSupported: ( error: CameraRuntimeError ) => void,
  panToZoom: PanGesture,
  pinchToZoom: PinchGesture,
  resizeMode?: "cover" | "contain",
  inactive?: boolean
}

// A container for the Camera component
// that has logic that applies to both use cases in StandardCamera and AICamera
const CameraView = ( {
  animatedProps,
  cameraRef,
  cameraScreen,
  debugFormat,
  device,
  frameProcessor,
  onCameraError,
  onCaptureError,
  onClassifierError,
  onDeviceNotSupported,
  panToZoom,
  pinchToZoom,
  resizeMode,
  inactive
}: Props ) => {
  const {
    animatedStyle,
    tapToFocus
  } = useFocusTap( cameraRef, device.supportsFocus );

  // check if camera page is active
  const isFocused = useIsFocused( );
  const appState = useAppState( );
  const isActive = !inactive && isFocused && appState === "active";

  // Select the camera format based on the screen aspect ratio on ai camera as it is full-screen
  const screen = Dimensions.get( "screen" );
  const aiVideoAspectRatio = screen.height / screen.width;
  const aiPhotoAspectRatio = screen.height / screen.width;
  const standardVideoAspectRatio = 4 / 3;
  const standardPhotoAspectRatio = 4 / 3;
  // Select a format that provides the highest resolution for photos and videos
  const iosFormat = useCameraFormat( device, [
    {
      videoAspectRatio: cameraScreen === "standard"
        ? standardVideoAspectRatio
        : aiVideoAspectRatio
    },
    {
      photoAspectRatio: cameraScreen === "standard"
        ? standardPhotoAspectRatio
        : aiPhotoAspectRatio
    },
    { photoResolution: "max" },
    { videoResolution: "max" }
  ] );
  if ( Platform.OS === "android" ) {
    console.log( "Android is not using a specific camera format because we never got around to" );
  }
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
        onDeviceNotSupported( error );
        return;
      }

      if ( error.code.includes( "capture/" ) ) {
        console.log( "error :>> ", error );
        onCaptureError( error );
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
      onCameraError( error );
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
        gesture={Gesture.Simultaneous( tapToFocus, panToZoom, pinchToZoom )}
        className="overflow-hidden"
      >
        <ReanimatedCamera
          // Shared props between StandardCamera and AICamera
          ref={cameraRef}
          animatedProps={animatedProps}
          device={device}
          // we can't use the native zoom since it doesn't expose a zoom value to JS
          enableZoomGesture={false}
          exposure={exposure}
          format={debugFormat || format}
          frameProcessor={frameProcessor}
          isActive={isActive}
          onError={onError}
          outputOrientation="device"
          photo
          photoQualityBalance="quality"
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
