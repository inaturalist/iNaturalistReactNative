// @flow
import CameraView from "components/Camera/CameraView";
import type { Node } from "react";
import React, {
  useEffect
} from "react";
import { Platform } from "react-native";
import {
  runAsync,
  useFrameProcessor
} from "react-native-vision-camera";
import { Worklets } from "react-native-worklets-core";
import { modelPath, modelVersion, taxonomyPath } from "sharedHelpers/cvModel.ts";
import { orientationPatchFrameProcessor } from "sharedHelpers/visionCameraPatches";
import { useDeviceOrientation } from "sharedHooks";
import * as InatVision from "vision-camera-plugin-inatvision";

type Props = {
  animatedProps: any,
  cameraRef: Object,
  confidenceThreshold?: number,
  device: Object,
  fps?: number,
  numStoredResults?: number,
  cropRatio?: number,
  onCameraError: Function,
  onCaptureError: Function,
  onClassifierError: Function,
  onDeviceNotSupported: Function,
  onLog: Function,
  onTaxaDetected: Function,
  onZoomChange?: Function,
  onZoomStart?: Function,
  takingPhoto: boolean
};

const DEFAULT_CONFIDENCE_THRESHOLD = 0.5;
const DEFAULT_NUM_STORED_RESULTS = 4;
const DEFAULT_CROP_RATIO = 1.0;

const FrameProcessorCamera = ( {
  animatedProps,
  cameraRef,
  confidenceThreshold = DEFAULT_CONFIDENCE_THRESHOLD,
  device,
  fps,
  numStoredResults = DEFAULT_NUM_STORED_RESULTS,
  cropRatio = DEFAULT_CROP_RATIO,
  onCameraError,
  onCaptureError,
  onClassifierError,
  onDeviceNotSupported,
  onLog,
  onTaxaDetected,
  onZoomChange,
  onZoomStart,
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

  const handleResults = Worklets.createRunInJsFn( predictions => {
    onTaxaDetected( predictions );
  } );
  const handleError = Worklets.createRunInJsFn( error => {
    onClassifierError( error );
  } );

  const patchedOrientationAndroid = orientationPatchFrameProcessor( deviceOrientation );
  const frameProcessor = useFrameProcessor(
    frame => {
      "worklet";

      if ( takingPhoto ) {
        return;
      }

      runAsync( frame, () => {
        "worklet";

        // Reminder: this is a worklet, running on the UI thread.
        try {
          const result = InatVision.inatVision( frame, {
            version: modelVersion,
            modelPath,
            taxonomyPath,
            // Johannes: when I copied over the native code from the legacy
            // react-native-camera on Android this value had to be a string. On
            // iOS I changed the API to also accept a string (was number).
            // Maybe, the intention would look clearer if we refactor to use a
            // number here.
            confidenceThreshold: confidenceThreshold.toString( ),
            numStoredResults,
            cropRatio,
            patchedOrientationAndroid
          } );
          handleResults( result );
        } catch ( classifierError ) {
          console.log( `Error: ${classifierError.message}` );
          handleError( classifierError );
        }
      } );
    },
    [modelVersion, confidenceThreshold, takingPhoto, patchedOrientationAndroid, numStoredResults, cropRatio]
  );

  return (
    <CameraView
      cameraRef={cameraRef}
      device={device}
      fps={fps}
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
