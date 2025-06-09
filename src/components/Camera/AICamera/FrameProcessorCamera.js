// @flow
import { useNavigation } from "@react-navigation/native";
import CameraView from "components/Camera/CameraView.tsx";
import {
  useFrameProcessor
} from "components/Camera/helpers/visionCameraWrapper";
import InatVision from "components/Camera/helpers/visionPluginWrapper";
import type { Node } from "react";
import React, {
  useEffect,
  useState
} from "react";
import { Platform } from "react-native";
import { Worklets } from "react-native-worklets-core";
import {
  geomodelPath,
  modelPath,
  modelVersion,
  taxonomyPath
} from "sharedHelpers/mlModel.ts";
import { logStage } from "sharedHelpers/sentinelFiles.ts";
import { usePatchedRunAsync } from "sharedHelpers/visionCameraPatches";
import { useLayoutPrefs } from "sharedHooks";
import useStore from "stores/useStore";

type Props = {
  // $FlowIgnore
  animatedProps: unknown,
  cameraRef: Object,
  confidenceThreshold?: number,
  debugFormat?: Object,
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
  inactive?: boolean,
  resetCameraOnFocus: Function,
  userLocation?: Object, // UserLocation | null
  useLocation: boolean
};

const DEFAULT_FPS = 1;
const DEFAULT_CONFIDENCE_THRESHOLD = 70;
const DEFAULT_NUM_STORED_RESULTS = 5;
const DEFAULT_CROP_RATIO = 1.0;

let framesProcessingTime = [];

const FrameProcessorCamera = ( {
  animatedProps,
  cameraRef,
  confidenceThreshold = DEFAULT_CONFIDENCE_THRESHOLD,
  cropRatio = DEFAULT_CROP_RATIO,
  debugFormat,
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
  inactive,
  resetCameraOnFocus,
  userLocation,
  useLocation
}: Props ): Node => {
  const sentinelFileName = useStore( state => state.sentinelFileName );
  const { isDefaultMode } = useLayoutPrefs( );
  const [lastTimestamp, setLastTimestamp] = useState( undefined );

  const navigation = useNavigation();

  // When useLocation changes, we need to reset the stored results
  useEffect( () => {
    InatVision.resetStoredResults();
  }, [useLocation] );

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
      InatVision.resetStoredResults( );
      resetCameraOnFocus( );
    } );

    return unsubscribeFocus;
  }, [navigation, resetCameraOnFocus] );

  useEffect( () => {
    const unsubscribeBlur = navigation.addListener( "blur", () => {
      InatVision.resetStoredResults();
      resetCameraOnFocus( );
    } );

    return unsubscribeBlur;
  }, [navigation, resetCameraOnFocus, sentinelFileName] );

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

  const patchedRunAsync = usePatchedRunAsync( );
  const hasUserLocation = userLocation?.latitude != null && userLocation?.longitude != null;
  const useGeomodel = isDefaultMode
    ? hasUserLocation
    : ( useLocation && hasUserLocation );
  // The vision-plugin has a function to look up the location of the user in a h3 gridded world
  // unfortunately, I was not able to run this new function in the worklets directly,
  // so we need to do this here before calling the useFrameProcessor hook.
  // For predictions from file this function runs in the vision-plugin code directly.
  const geoModelCellLocation = hasUserLocation
    ? InatVision.getCellLocation( userLocation )
    : null;
  const frameProcessor = useFrameProcessor(
    frame => {
      "worklet";

      if ( takingPhoto ) {
        return;
      }
      const timestamp = Date.now();
      // If there is no lastTimestamp, i.e. the first time this runs do not compare
      if ( lastTimestamp ) {
        const timeSinceLastFrame = timestamp - lastTimestamp;
        if ( timeSinceLastFrame < 1000 / fps ) {
          return;
        }
      }

      patchedRunAsync( frame, ( ) => {
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
            useGeomodel,
            geomodelPath,
            location: {
              latitude: geoModelCellLocation?.latitude,
              longitude: geoModelCellLocation?.longitude,
              elevation: geoModelCellLocation?.elevation
            }
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
      numStoredResults,
      cropRatio,
      lastTimestamp,
      fps,
      useGeomodel,
      geoModelCellLocation
    ]
  );

  return (
    <CameraView
      animatedProps={animatedProps}
      cameraRef={cameraRef}
      cameraScreen="ai"
      debugFormat={debugFormat}
      device={device}
      frameProcessor={frameProcessor}
      onCameraError={async error => {
        onCameraError( error );
        await logStage( sentinelFileName, "fallback_camera_error" );
      }}
      onCaptureError={async error => {
        onCaptureError( error );
        await logStage( sentinelFileName, "camera_capture_error" );
      }}
      onClassifierError={async error => {
        onClassifierError( error );
        await logStage( sentinelFileName, "camera_classifier_error" );
      }}
      onDeviceNotSupported={async error => {
        onDeviceNotSupported( error );
        await logStage( sentinelFileName, "camera_device_not_supported_error" );
      }}
      pinchToZoom={pinchToZoom}
      inactive={inactive}
    />
  );
};

export default FrameProcessorCamera;
