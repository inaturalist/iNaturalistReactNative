// @flow
import CameraView from "components/Camera/CameraView";
import type { Node } from "react";
import React, {
  useEffect
} from "react";
import { Platform } from "react-native";
import * as REA from "react-native-reanimated";
import {
  useFrameProcessor
} from "react-native-vision-camera";
import { dirModel, dirTaxonomy } from "sharedHelpers/cvModel";
import * as InatVision from "vision-camera-plugin-inatvision";

type Props = {
  cameraRef: Object,
  device: Object,
  onTaxaDetected: Function,
  onClassifierError: Function,
  onDeviceNotSupported: Function,
  onCaptureError: Function,
  onCameraError: Function,
  onLog: Function
};

// Johannes: when I copied over the native code from the legacy react-native-camera on Android
// this value had to be a string. On iOS I changed the API to also accept a string (was number).
// Maybe, the intention would look clearer if we refactor to use a number here.
const confidenceThreshold = "0.7";

const FrameProcessorCamera = ( {
  cameraRef,
  device,
  onTaxaDetected,
  onClassifierError,
  onDeviceNotSupported,
  onCaptureError,
  onCameraError,
  onLog
}: Props ): Node => {
  useEffect( () => {
    // This registers a listener for the frame processor plugin's log events
    // iOS part exposes no logging, so calling it would crash
    if ( Platform.OS === "android" ) {
      InatVision.addLogListener( event => {
        // The vision-plugin events are in this format { log: "string" }
        onLog( event );
      } );
    }

    return () => {
      InatVision.removeLogListener();
    };
  }, [onLog] );

  const frameProcessor = useFrameProcessor(
    frame => {
      "worklet";

      // Reminder: this is a worklet, running on the UI thread.
      try {
        const results = InatVision.inatVision(
          frame,
          dirModel,
          dirTaxonomy,
          confidenceThreshold
        );
        REA.runOnJS( onTaxaDetected )( results );
      } catch ( classifierError ) {
        console.log( `Error: ${classifierError.message}` );
        REA.runOnJS( onClassifierError )( classifierError );
      }
    },
    [confidenceThreshold]
  );

  return (
    <CameraView
      cameraRef={cameraRef}
      device={device}
      onClassifierError={onClassifierError}
      onDeviceNotSupported={onDeviceNotSupported}
      onCaptureError={onCaptureError}
      onCameraError={onCameraError}
      frameProcessor={frameProcessor}
      // A value of 1 indicates that the frame processor gets executed once per second.
      // This roughly equals the setting of the legacy camera of 1000ms between predictions,
      // i.e. what taxaDetectionInterval was set to.
      frameProcessorFps={1}
    />
  );
};

export default FrameProcessorCamera;
