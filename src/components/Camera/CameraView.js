import { useIsFocused } from "@react-navigation/native";
import useFocusTap from "components/Camera/hooks/useFocusTap.ts";
import VeryBadIpadRotator from "components/SharedComponents/VeryBadIpadRotator";
import type { Node } from "react";
import React, {
  useCallback
} from "react";
import { Platform, StyleSheet } from "react-native";
import {
  Gesture, GestureDetector
} from "react-native-gesture-handler";
import Reanimated from "react-native-reanimated";
import { Camera, useCameraFormat } from "react-native-vision-camera";
import { orientationPatch } from "sharedHelpers/visionCameraPatches";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation";

import FocusSquare from "./FocusSquare";

const ReanimatedCamera = Reanimated.createAnimatedComponent( Camera );
Reanimated.addWhitelistedNativeProps( {
  zoom: true
} );

type Props = {
  animatedProps: unknown,
  cameraRef: Object,
  device: Object,
  frameProcessor?: Function,
  onCameraError?: Function,
  onCaptureError?: Function,
  onClassifierError?: Function,
  onDeviceNotSupported?: Function,
  pinchToZoom?: Function,
  resizeMode?: string
};

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
}: Props ): Node => {
  const {
    focusTapAnimation,
    tapToFocus,
    tappedCoordinates
  } = useFocusTap( cameraRef, device.supportsFocus );

  // check if camera page is active
  const isFocused = useIsFocused( );

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

  const onError = useCallback(
    error => {
      // error is a CameraRuntimeError =
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

  // react-native-vision-camera v3.9.0:
  // iPad camera preview is wrong in anything else than portrait, hence the
  // VeryBadIpadRotator, which will rotate its contents us a style transform
  // and adjust position accordingly

  // Note that overflow-hidden handles what seems to be a bug in android in
  // which the Camera overflows its view
  return (
    <GestureDetector
      gesture={Gesture.Simultaneous( tapToFocus, pinchToZoom )}
      className="overflow-hidden"
    >
      <VeryBadIpadRotator>
        <ReanimatedCamera
          // Shared props between StandardCamera and AICamera
          ref={cameraRef}
          device={device}
          format={format}
          exposure={exposure}
          isActive={isFocused}
          style={StyleSheet.absoluteFill}
          photo
          enableZoomGesture={false}
          onError={onError}
          // react-native-vision-camera v3.9.0: This prop is undocumented, but does work on iOS
          // it does nothing on Android so we set it to null there
          orientation={orientationPatch( deviceOrientation )}
          photoQualityBalance="quality"
          frameProcessor={frameProcessor}
          pixelFormat="yuv"
          animatedProps={animatedProps}
          resizeMode={resizeMode || "cover"}
        />
        <FocusSquare
          focusTapAnimation={focusTapAnimation}
          tappedCoordinates={tappedCoordinates}
        />
      </VeryBadIpadRotator>
    </GestureDetector>
  );
};

export default CameraView;
