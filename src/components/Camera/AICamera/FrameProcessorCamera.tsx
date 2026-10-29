import { useNavigation } from "@react-navigation/native";
import CameraView from "components/Camera/CameraView";
import {
  useAsyncRunner,
  useFrameOutput,
} from "components/Camera/helpers/visionCameraWrapper";
import InatVision from "components/Camera/helpers/visionPluginWrapper";
import type { NoBottomTabStackScreenProps } from "navigation/types";
import type { RefObject } from "react";
import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";
import type {
  PanGesture,
  PinchGesture,
} from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import type {
  CameraDevice,
  CameraPhotoOutput,
  CameraRef,
} from "react-native-vision-camera";
import { scheduleOnRN } from "react-native-worklets";
import {
  geomodelPath,
  modelPath,
  modelVersion,
  taxonomyPath,
} from "sharedHelpers/mlModel";
import { logStage } from "sharedHelpers/sentinelFiles";
import { useLayoutPrefs } from "sharedHooks";
import type { UserLocation } from "sharedHooks/useWatchPosition";
import useStore from "stores/useStore";
import type { Result } from "vision-camera-plugin-inatvision";

interface Props {
  cameraRef: RefObject<CameraRef | null>;
  device: CameraDevice;
  onCameraError: ( error: Error ) => void;
  onLog: ( event: { log: string } ) => void;
  onTaxaDetected: ( result: Result ) => void;
  panToZoom: PanGesture;
  pinchToZoom: PinchGesture;
  takingPhoto: boolean;
  inactive?: boolean;
  resetCameraOnFocus: () => void;
  userLocation?: UserLocation | null;
  useLocation: boolean;
  photoOutput: CameraPhotoOutput;
  onClassifierError: ( error: Error ) => void;
  zoom: SharedValue<number>;
}

const FPS = 1;
const CONFIDENCE_THRESHOLD = 70;
const NUM_STORED_RESULTS = 5;
const CROP_RATIO = 1.0;

const FrameProcessorCamera = ( {
  cameraRef,
  device,
  onCameraError,
  onLog,
  onTaxaDetected,
  panToZoom,
  pinchToZoom,
  takingPhoto,
  inactive,
  resetCameraOnFocus,
  userLocation,
  useLocation,
  photoOutput,
  onClassifierError,
  zoom,
}: Props ) => {
  const sentinelFileName = useStore( state => state.sentinelFileName );
  const { isDefaultMode } = useLayoutPrefs( );
  const [lastTimestamp, setLastTimestamp] = useState<number | undefined>( undefined );

  const navigation = useNavigation<NoBottomTabStackScreenProps<"Camera">["navigation"]>( );

  const framesProcessingTime = useRef<number[]>( [] );

  // When useLocation changes, we need to reset the stored results
  useEffect( () => {
    InatVision.resetStoredResults( );
  }, [useLocation] );

  useEffect( ( ) => {
    // This registers a listener for the frame processor plugin's log events
    // iOS part exposes no logging, so calling it would crash
    if ( Platform.OS === "android" ) {
      InatVision.addLogListener( ( event: { log: string } ) => {
        // The vision-plugin events are in this format { log: "string" }
        onLog( event );
      } );
    }

    return () => {
      InatVision.removeLogListener( );
    };
  }, [onLog] );

  useEffect( () => {
    const resetAll = () => {
      InatVision.resetStoredResults( );
      resetCameraOnFocus( );
    };
    const unsubscribeFocus = navigation.addListener( "focus", resetAll );
    const unsubscribeBlur = navigation.addListener( "blur", resetAll );

    return () => {
      unsubscribeFocus( );
      unsubscribeBlur( );
    };
  }, [navigation, resetCameraOnFocus] );

  const handleResults = ( result: Result, timeTaken: number ) => {
    setLastTimestamp( result.timestamp );
    framesProcessingTime.current.push( timeTaken );
    if ( framesProcessingTime.current.length === 10 ) {
      const avgTime = framesProcessingTime.current.reduce( ( a, b ) => a + b, 0 ) / 10;
      onLog( { log: `Average frame processing time over 10 frames: ${avgTime}ms` } );
      framesProcessingTime.current = [];
    }
    onTaxaDetected( result );
  };

  const handleError = ( error: Error ) => {
    onClassifierError( error );
  };

  const hasUserLocation = userLocation?.latitude != null && userLocation?.longitude != null;
  const useGeomodel = isDefaultMode
    ? hasUserLocation
    : ( useLocation && hasUserLocation );
  // The vision-plugin has a function to look up the location of the user in a h3 gridded world
  // unfortunately, I was not able to run this new function in the worklets directly,
  // so we need to do this here before calling the useFrameOutput hook.
  // For predictions from file this function runs in the vision-plugin code directly.
  const geoModelCellLocation = hasUserLocation
    ? InatVision.getCellLocation( userLocation )
    : null;
  const cellLat = geoModelCellLocation?.latitude;
  const cellLng = geoModelCellLocation?.longitude;
  const cellElev = geoModelCellLocation?.elevation;
  const hasCellLocation
    = typeof cellLat === "number"
    && typeof cellLng === "number"
    && typeof cellElev === "number";

  const asyncRunner = useAsyncRunner( );
  const frameOutput = useFrameOutput( {
    allowDeferredStart: true,
    enablePhysicalBufferRotation: true,
    pixelFormat: "yuv",
    onFrame( frame ) {
      "worklet";

      const wasHandled = asyncRunner.runAsync( ( ) => {
        "worklet";

        try {
          if ( takingPhoto ) {
            return;
          }
          const timestamp = Date.now();
          // If there is no lastTimestamp, i.e. the first time this runs do not compare
          if ( lastTimestamp ) {
            const timeSinceLastFrame = timestamp - lastTimestamp;
            if ( timeSinceLastFrame < 1000 / FPS ) {
              return;
            }
          }
          // Reminder: this is a worklet, running on a C++ thread. Make sure to check the
          // react-native-worklets-core documentation for what is supported in those worklets.
          const timeBefore = Date.now( );

          const options = {
            version: modelVersion,
            modelPath,
            taxonomyPath,
            confidenceThreshold: CONFIDENCE_THRESHOLD,
            numStoredResults: NUM_STORED_RESULTS,
            cropRatio: CROP_RATIO,
            useGeomodel,
            geomodelPath,
          };

          if ( useGeomodel && hasCellLocation ) {
            options.location = {
              latitude: cellLat,
              longitude: cellLng,
              elevation: cellElev,
            };
          }

          const result = InatVision.inatVision( frame, options );
          const timeAfter = Date.now();
          const timeTaken = timeAfter - timeBefore;
          scheduleOnRN( handleResults, result, timeTaken );
        } catch ( classifierError ) {
          console.log( `Error: ${classifierError.message}` );
          scheduleOnRN( handleError, classifierError );
        } finally {
          frame.dispose();
        }
      } );
      if ( !wasHandled ) {
        // `asyncRunner` is busy - drop this Frame!
        frame.dispose();
      }
    },
  } );

  return (
    <CameraView
      cameraRef={cameraRef}
      cameraScreen="ai"
      device={device}
      onCameraError={async error => {
        onCameraError( error );
        await logStage( sentinelFileName, "fallback_camera_error" );
      }}
      panToZoom={panToZoom}
      pinchToZoom={pinchToZoom}
      inactive={inactive}
      photoOutput={photoOutput}
      frameOutput={frameOutput}
      zoom={zoom}
    />
  );
};

export default FrameProcessorCamera;
