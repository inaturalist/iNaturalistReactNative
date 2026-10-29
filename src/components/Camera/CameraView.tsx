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
  Platform, StyleSheet,
} from "react-native";
import type {
  PanGesture,
  PinchGesture,
} from "react-native-gesture-handler";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import type {
  CameraDevice,
  CameraFrameOutput,
  CameraPhotoOutput,
  CameraRef,
  CameraRuntimeError,
} from "react-native-vision-camera";

import FocusSquare from "./FocusSquare";

interface Props {
  cameraRef: RefObject<CameraRef | null>;
  device: CameraDevice;
  frameOutput: CameraFrameOutput;
  onCameraError: ( error: CameraRuntimeError ) => void;
  panToZoom: PanGesture;
  pinchToZoom: PinchGesture;
  resizeMode?: "cover" | "contain";
  inactive?: boolean;
  photoOutput: CameraPhotoOutput;
  zoom: SharedValue<number>;
}

// A container for the Camera component
// that has logic that applies to both use cases in StandardCamera and AICamera
const CameraView = ( {
  cameraRef,
  device,
  frameOutput,
  onCameraError,
  panToZoom,
  pinchToZoom,
  resizeMode,
  inactive,
  photoOutput,
  zoom,
}: Props ) => {
  const { animatedStyle, tapToFocus, tappedCoordinates }
    = useFocusTap( cameraRef );

  // check if camera page is active
  const isFocused = useIsFocused( );
  const appState = useAppState( );
  const isActive = !inactive && isFocused && appState === "active";

  const onError = useCallback(
    ( error: Error ) => {
      // { code: string, message: string, cause?: {} }
      console.log( "error", error );
      onCameraError( error );
    },
    [onCameraError],
  );

  const gesture
    = Platform.OS === "android"
      ? Gesture.Simultaneous( tapToFocus, pinchToZoom )
      : Gesture.Simultaneous( tapToFocus, panToZoom, pinchToZoom );

  // Note that overflow-hidden handles what seems to be a bug in android in
  // which the Camera overflows its view
  return (
    <>
      <GestureDetector gesture={gesture} className="overflow-hidden">
        <Camera
          // Shared props between StandardCamera and AICamera
          ref={cameraRef}
          device={device}
          // we can't use the native zoom since it doesn't expose a zoom value to JS
          enableNativeZoomGesture={false}
          isActive={isActive}
          onError={onError}
          orientationSource="device"
          resizeMode={resizeMode || "cover"}
          style={StyleSheet.absoluteFill}
          outputs={[photoOutput, frameOutput]}
          constraints={[{ resolutionBias: photoOutput }]}
          zoom={zoom}
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
