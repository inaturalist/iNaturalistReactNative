// @flow
import { Text, View } from "components/styledComponents";
import type { Node } from "react";
import React, { useRef, useState } from "react";
import { StatusBar, StyleSheet } from "react-native";
import {
  useCameraDevices
} from "react-native-vision-camera";

import CameraContainer from "./CameraContainer";
import FrameProcessorCamera from "./FrameProcessorCamera";
const ARCamera = (): Node => {
  const [results, setResult] = useState( [] );

  const devices = useCameraDevices();
  const device = devices.back;

  const camera = useRef<any>( null );

  const handleTaxaDetected = cvResults => {
    /*
      Using FrameProcessorCamera results in this as predictions atm on Android
      [
        {
          "stateofmatter": [
            {"ancestor_ids": [Array], "name": xx, "rank": xx, "score": xx, "taxon_id": xx}
          ]
        },
        {
          "order": [
            {"ancestor_ids": [Array], "name": xx, "rank": xx, "score": xx, "taxon_id": xx}
          ]
        },
        {
          "species": [
            {"ancestor_ids": [Array], "name": xx, "rank": xx, "score": xx, "taxon_id": xx}
          ]
        }
      ]
    */
    const predictions = cvResults.map( result => {
      const rank = Object.keys( result )[0];
      const prediction = result[rank][0];
      prediction.rank = rank;
      return prediction;
    } );
    setResult( predictions );
  };

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
      {results.map( ( result: { rank: string, name: string } ) => (
        <Text key={result.rank} style={styles.label}>
          {result.name}
        </Text>
      ) )}
      {device && (
        <CameraContainer
          cameraComponent={FrameProcessorCamera}
          cameraRef={camera}
          device={device}
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
