// @flow
import type { Node } from "react";
import React, {
  useEffect
} from "react";
import { Platform } from "react-native";
import * as REA from "react-native-reanimated";
import {
  Camera,
  useFrameProcessor
} from "react-native-vision-camera";
import { dirModel, dirTaxonomy } from "sharedHelpers/cvModel";
// eslint-disable-next-line import/no-unresolved
import * as InatVision from "vision-camera-plugin-inatvision";

type Props = {
  photo: boolean,
  enableZoomGesture: boolean,
  isActive: boolean,
  style: Object,
  onError: Function,
  ref: Object,
  device: Object,
  orientation?: any,
  onTaxaDetected: Function,
  onClassifierError: Function,
  onLog: Function
};

const confidenceThreshold = "0.7";

const FrameProcessorCamera = ( {
  photo,
  enableZoomGesture,
  isActive,
  style,
  onError,
  ref,
  device,
  orientation,
  onTaxaDetected,
  onClassifierError,
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
        // TODO: needs to throw Exception in the native code for it to work here?
        // Currently the native side throws RuntimeException but
        // that doesn't seem to arrive here over he bridge
        console.log( `Error: ${classifierError.message}` );
        const returnError = {
          nativeEvent: { error: classifierError.message }
        };
        REA.runOnJS( onClassifierError )( returnError );
      }
      // Johannes: I did a read though of the native code
      // that is triggered when using ref.current.takePictureAsync()
      // and to me it seems everything should be handled by vision-camera itself.
      // However, there is also some Exif and device orientation stuff going on.
      // related code that would need to be tested if it all is saved as expected.
    },
    [confidenceThreshold]
  );

  return (
    <Camera
      frameProcessor={frameProcessor}
      // A value of 1 indicates that the frame processor gets executed once per second.
      // This roughly equals the setting of the legacy camera of 1000ms between predictions,
      // i.e. what taxaDetectionInterval was set to.
      frameProcessorFps={1}
      photo={photo}
      enableZoomGesture={enableZoomGesture}
      isActive={isActive}
      style={style}
      onError={onError}
      ref={ref}
      device={device}
      orientation={orientation}
    />
  );
};

export default FrameProcessorCamera;
