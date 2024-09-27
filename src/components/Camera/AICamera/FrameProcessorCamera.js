// @flow
import { useNavigation } from "@react-navigation/native";
import CameraView from "components/Camera/CameraView.tsx";
import InatVision from "components/Camera/helpers/vision-camera-plugin-inatvision-imports";
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

type Props = {
  // $FlowIgnore
  animatedProps: unknown,
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
  pinchToZoom?: Function,
  takingPhoto: boolean,
  inactive?: boolean
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
  cropRatio = DEFAULT_CROP_RATIO,
  device,
  fps = DEFAULT_FPS,
  numStoredResults = DEFAULT_NUM_STORED_RESULTS,
  onCameraError,
  onCaptureError,
  onClassifierError,
  onDeviceNotSupported,
  onLog,
  onTaxaDetected,
  pinchToZoom,
  takingPhoto,
  inactive
}: Props ): Node => {
  const { deviceOrientation } = useDeviceOrientation();
  const [lastTimestamp, setLastTimestamp] = useState( Date.now() );

  const navigation = useNavigation();

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

  useEffect( () => {
    const unsubscribeFocus = navigation.addListener( "focus", () => {
      InatVision.resetStoredResults();
    } );

    return unsubscribeFocus;
  }, [navigation] );

  useEffect( () => {
    const unsubscribeBlur = navigation.addListener( "blur", () => {
      InatVision.resetStoredResults();
    } );

    return unsubscribeBlur;
  }, [navigation] );

  const handleResults = Worklets.createRunOnJS( ( result, timeTaken ) => {
    setLastTimestamp( result.timestamp );
    framesProcessingTime.push( timeTaken );
    if ( framesProcessingTime.length === 10 ) {
      const avgTime = framesProcessingTime.reduce( ( a, b ) => a + b, 0 ) / 10;
      onLog( { log: `Average frame processing time over 10 frames: ${avgTime}ms` } );
      framesProcessingTime = [];
    }
    onTaxaDetected( result );
  } );

  const handleError = Worklets.createRunOnJS( error => {
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
      animatedProps={animatedProps}
      cameraRef={cameraRef}
      device={device}
      frameProcessor={frameProcessor}
      onCameraError={onCameraError}
      onCaptureError={onCaptureError}
      onClassifierError={onClassifierError}
      onDeviceNotSupported={onDeviceNotSupported}
      pinchToZoom={pinchToZoom}
      inactive={inactive}
    />
  );
};

export default FrameProcessorCamera;
