// @flow
import { Text, View } from "components/styledComponents";
import type { Node } from "react";
import React, { useRef, useState } from "react";
import { StatusBar, StyleSheet } from "react-native";
import {
  useCameraDevices
} from "react-native-vision-camera";
import { dirModel, dirTaxonomy } from "sharedHelpers/cvModel";

import CameraContainer from "./CameraContainer";
import FrameProcessorCamera from "./FrameProcessorCamera";
const ARCamera = (): Node => {
  const devices = useCameraDevices();
  const device = devices.back;

  const camera = useRef<any>( null );

  const handleClassifierError = event => {
    console.log( "handleClassifierError event :>> ", event );
    // TODO: when we hit this error, it means the ARCamera is basically useless because there is an
    // error with the classifier.
    // We should show an error message and maybe also disable the ARCamera.
  };

  const handleLog = event => {
    console.log( "handleLog event :>> ", event );
    // TODO: this handles incoming logs from the vision-camera-plugin-inatvision,
    // can be used for debugging, added to a logfile, etc.
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar hidden />
      {device && (
        <CameraContainer
          cameraComponent={FrameProcessorCamera}
          cameraRef={camera}
          device={device}
          modelPath={dirModel}
          taxonomyPath={dirTaxonomy}
          confidenceThreshold={confidenceThresholdString}
          onTaxaDetected={handleTaxaDetected}
          // onCameraError={handleCameraError}
          onClassifierError={handleClassifierError}
          // onDeviceNotSupported={handleDeviceNotSupported}
          // onCaptureError={handleCaptureError}
          onLog={handleLog}
        />
      )}
    </View>
  );
};

export default ARCamera;
