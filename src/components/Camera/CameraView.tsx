import { useAppState } from "@react-native-community/hooks";
import { useIsFocused } from "@react-navigation/native";
import {
  Camera,
} from "components/Camera/helpers/visionCameraWrapper";
import useFocusTap from "components/Camera/hooks/useFocusTap";
import type { RefObject } from "react";
import React, {
  useCallback,
} from "react";
import {
  Dimensions, Platform, StyleSheet,
} from "react-native";
import type {
  PanGesture,
  PinchGesture,
} from "react-native-gesture-handler";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Reanimated from "react-native-reanimated";
import type {
  CameraDevice,
  CameraPhotoOutput,
  CameraProps,
  CameraRef,
  CameraRuntimeError,
  ReadonlyFrameProcessor,
} from "react-native-vision-camera";

import FocusSquare from "./FocusSquare";

const ReanimatedCamera = Reanimated.createAnimatedComponent( Camera );

interface Props {
  animatedProps: CameraProps;
  cameraRef: RefObject<CameraRef | null>;
  cameraScreen: "standard" | "ai";
  device: CameraDevice;
  frameProcessor?: ReadonlyFrameProcessor;
  onCameraError: ( error: CameraRuntimeError ) => void;
  panToZoom: PanGesture;
  pinchToZoom: PinchGesture;
  resizeMode?: "cover" | "contain";
  inactive?: boolean;
  photoOutput: CameraPhotoOutput;
}

// A container for the Camera component
// that has logic that applies to both use cases in StandardCamera and AICamera
const CameraView = ( {
  animatedProps,
  cameraRef,
  cameraScreen,
  device,
  frameProcessor,
  onCameraError,
  panToZoom,
  pinchToZoom,
  resizeMode,
  inactive,
  photoOutput,
}: Props ) => {
  const {
    animatedStyle,
    tapToFocus,
    tappedCoordinates,
  } = useFocusTap( cameraRef );

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

  const onError = useCallback(
    ( error: Error ) => {
      // { code: string, message: string, cause?: {} }
      console.log( "error", error );
      onCameraError( error );
    },
    [
      onCameraError,
    ],
  );

  const gesture
    = Platform.OS === "android"
      ? Gesture.Simultaneous( tapToFocus, pinchToZoom )
      : Gesture.Simultaneous( tapToFocus, panToZoom, pinchToZoom );

  // Note that overflow-hidden handles what seems to be a bug in android in
  // which the Camera overflows its view
  return (
    <>
      <GestureDetector
        gesture={gesture}
        className="overflow-hidden"
      >
        <ReanimatedCamera
          // Shared props between StandardCamera and AICamera
          ref={cameraRef}
          animatedProps={animatedProps}
          device={device}
          // we can't use the native zoom since it doesn't expose a zoom value to JS
          frameProcessor={frameProcessor}
          enableNativeZoomGesture={false}
          isActive={isActive}
          onError={onError}
          pixelFormat="yuv"
          orientationSource="device"
          resizeMode={resizeMode || "cover"}
          style={StyleSheet.absoluteFill}
          outputs={[photoOutput]}
          constraints={[
            // {
            //   videoAspectRatio:
            //     cameraScreen === "standard"
            //       ? standardVideoAspectRatio
            //       : aiVideoAspectRatio,
            // },
            // {
            //   photoAspectRatio:
            //     cameraScreen === "standard"
            //       ? standardPhotoAspectRatio
            //       : aiPhotoAspectRatio,
            // },
            { resolutionBias: photoOutput },
          ]}
        />
      </GestureDetector>
      <FocusSquare
        animatedStyle={animatedStyle}
        tappedCoordinates={tappedCoordinates}
      />
    </>
  );
};

export default CameraView;
