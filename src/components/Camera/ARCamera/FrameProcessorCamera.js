// @flow
import CameraView from "components/Camera/CameraView";
import type { Node } from "react";
import React, {
  useEffect
} from "react";
import { Platform } from "react-native";
import * as REA from "react-native-reanimated";
import {
  // react-native-vision-camera v3
  // runAtTargetFps,
  useFrameProcessor
} from "react-native-vision-camera";
// react-native-vision-camera v3
// import { Worklets } from "react-native-worklets-core";
import { modelPath, modelVersion, taxonomyPath } from "sharedHelpers/cvModel";
import { Worklets } from "react-native-worklets-core";
import { orientationPatchFrameProcessor } from "sharedHelpers/visionCameraPatches";
import { useDeviceOrientation } from "sharedHooks";
import * as InatVision from "vision-camera-plugin-inatvision";

type Props = {
  cameraRef: Object,
  device: Object,
  onTaxaDetected: Function,
  onClassifierError: Function,
  onDeviceNotSupported: Function,
  onCaptureError: Function,
  onCameraError: Function,
  onLog: Function,
  animatedProps: any,
  onZoomStart?: Function,
  onZoomChange?: Function,
  takingPhoto: boolean,
};

// Johannes: when I copied over the native code from the legacy react-native-camera on Android
// this value had to be a string. On iOS I changed the API to also accept a string (was number).
// Maybe, the intention would look clearer if we refactor to use a number here.
const confidenceThreshold = "0.5";

const FrameProcessorCamera = ( {
  cameraRef,
  device,
  onTaxaDetected,
  onClassifierError,
  onDeviceNotSupported,
  onCaptureError,
  onCameraError,
  onLog,
  animatedProps,
  onZoomStart,
  onZoomChange,
  takingPhoto
}: Props ): Node => {
  const { deviceOrientation } = useDeviceOrientation();

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

  // react-native-vision-camera v3
  // const handleResults = Worklets.createRunInJsFn( predictions => {
  //   onTaxaDetected( predictions );
  // } );
  // const handleError = Worklets.createRunInJsFn( error => {
  //   onClassifierError( error );
  // } );

  const patchedOrientationAndroid = orientationPatchFrameProcessor( deviceOrientation );
  const frameProcessor = useFrameProcessor(
    frame => {
      "worklet";

      if ( takingPhoto ) {
        return;
      }

      // react-native-vision-camera v2
      // Reminder: this is a worklet, running on the UI thread.
      try {
        const results = InatVision.inatVision( frame, {
          version: modelVersion,
          modelPath,
          taxonomyPath,
          confidenceThreshold
        } );
        REA.runOnJS( onTaxaDetected )( results );
      } catch ( classifierError ) {
        console.log( `Error: ${classifierError.message}` );
        REA.runOnJS( onClassifierError )( classifierError );
      }

      // react-native-vision-camera v3
      // runAtTargetFps( 1, () => {
      //   "worklet";
      //   // Reminder: this is a worklet, running on the UI thread.
      //   try {
      //     const results = InatVision.inatVision( frame, {
      //       version,
      //       modelPath,
      //       taxonomyPath,
      //       confidenceThreshold,
      //       patchedOrientationAndroid: deviceOrientation
      //     } );
      //     handleResults( results );
      //   } catch ( classifierError ) {
      //     console.log( `Error: ${classifierError.message}` );
      //     handleError( classifierError );
      //   }
      // } );
        // Reminder: this is a worklet, running on the UI thread.
        try {
          const results = InatVision.inatVision( frame, {
            version,
            modelPath,
            taxonomyPath,
            confidenceThreshold,
            patchedOrientationAndroid
          } );
          handleResults( results );
        } catch ( classifierError ) {
          console.log( `Error: ${classifierError.message}` );
          handleError( classifierError );
        }
      } );
    },
    [modelVersion, confidenceThreshold, takingPhoto, deviceOrientation]
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
      animatedProps={animatedProps}
      onZoomStart={onZoomStart}
      onZoomChange={onZoomChange}
    />
  );
};

export default FrameProcessorCamera;
