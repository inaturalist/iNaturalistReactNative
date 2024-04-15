// @flow
import CameraView from "components/Camera/CameraView";
import type { Node } from "react";
import React, {
  useEffect,
  useState
} from "react";
import { Platform } from "react-native";
import {
  useFrameProcessor
} from "react-native-vision-camera";
import { Worklets } from "react-native-worklets-core";
import { modelPath, modelVersion, taxonomyPath } from "sharedHelpers/cvModel.ts";
import {
  orientationPatchFrameProcessor,
  usePatchedRunAsync
} from "sharedHelpers/visionCameraPatches";
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

const DEFAULT_FPS = 1;
const DEFAULT_CONFIDENCE_THRESHOLD = 0.5;
const DEFAULT_NUM_STORED_RESULTS = 4;
const DEFAULT_CROP_RATIO = 1.0;

let framesProcessingTime = [];

const FrameProcessorCamera = ( {
  animatedProps,
  cameraRef,
  confidenceThreshold = DEFAULT_CONFIDENCE_THRESHOLD,
  device,
  fps = DEFAULT_FPS,
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
  const [lastTimestamp, setLastTimestamp] = useState( Date.now() );

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

  const handleResults = Worklets.createRunInJsFn( ( result, timeTaken ) => {
    // I don't know if it is a temporary thing but as of vision-camera@3.9.1
    // and react-native-woklets-core@0.4.0 the Array in the worklet does not have all
    // the methods of a normal array, so we need to convert it to a normal array here
    // getPredictionsForImage is fine
    let { predictions } = result;
    if ( !Array.isArray( predictions ) ) {
      predictions = Object.keys( predictions ).map( key => predictions[key] );
    }
    const handledResult = { predictions, timestamp: result.timestamp };
    // TODO: using current time here now, for some reason result.timestamp is not working
    setLastTimestamp( Date.now() );
    framesProcessingTime.push( timeTaken );
    if ( framesProcessingTime.length === 10 ) {
      const avgTime = framesProcessingTime.reduce( ( a, b ) => a + b, 0 ) / 10;
      onLog( { log: `Average frame processing time over 10 frames: ${avgTime}ms` } );
      framesProcessingTime = [];
    }
    onTaxaDetected( handledResult );
  } );

  const handleError = Worklets.createRunInJsFn( error => {
    onClassifierError( error );
  } );

  const patchedOrientationAndroid = orientationPatchFrameProcessor( deviceOrientation );
  const patchedRunAsync = usePatchedRunAsync( );
  const frameProcessor = useFrameProcessor(
    frame => {
      "worklet";

      if ( takingPhoto ) {
        return;
      }
      const timestamp = Date.now();
      const timeSinceLastFrame = timestamp - lastTimestamp;
      if ( timeSinceLastFrame < ( 1000 / fps ) ) {
        return;
      }

      patchedRunAsync( frame, () => {
        "worklet";

        // Reminder: this is a worklet, running on a C++ thread. Make sure to check the
        // react-native-worklets-core documentation for what is supported in those worklets.
        const timeBefore = Date.now();
        try {
          const result = InatVision.inatVision( frame, {
            version: modelVersion,
            modelPath,
            taxonomyPath,
            confidenceThreshold,
            numStoredResults,
            cropRatio,
            patchedOrientationAndroid
          } );
          const timeAfter = Date.now();
          const timeTaken = timeAfter - timeBefore;
          handleResults( result, timeTaken );
        } catch ( classifierError ) {
          console.log( `Error: ${classifierError.message}` );
          handleError( classifierError );
        }
      } );
    },
    [
      patchedRunAsync,
      modelVersion,
      confidenceThreshold,
      takingPhoto,
      patchedOrientationAndroid,
      numStoredResults,
      cropRatio,
      lastTimestamp,
      fps
    ]
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
