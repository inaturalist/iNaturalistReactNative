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

const styles = StyleSheet.create( {
  label: {
    position: "absolute",
    top: 48,
    zIndex: 1,
    padding: 4,
    marginHorizontal: 20,
    backgroundColor: "#000000",
    fontSize: 26,
    color: "white",
    textAlign: "center"
  }
} );

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
    // TODO: when we hit this error, there is an error with the classifier.
    // We should show an error message and maybe also disable the ARCamera.
  };

  const handleDeviceNotSupported = event => {
    console.log( "handleDeviceNotSupported event :>> ", event );
    // TODO: when we hit this error, something with the current device is not supported.
    // We should show an error message depending on the error and change the way we use it.
  };

  const handleCaptureError = event => {
    console.log( "handleCaptureError event :>> ", event );
    // TODO: when we hit this error, taking a photo did not work correctly
    // We should show an error message and do something if the error persists.
  };

  const handleCameraError = event => {
    console.log( "handleCameraError event :>> ", event );
    // TODO: This error is thrown when it does not fit in any of the above categories.
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
          onTaxaDetected={handleTaxaDetected}
          onClassifierError={handleClassifierError}
          onDeviceNotSupported={handleDeviceNotSupported}
          onCaptureError={handleCaptureError}
          onCameraError={handleCameraError}
          onLog={handleLog}
        />
      )}
    </View>
  );
};

export default ARCamera;
