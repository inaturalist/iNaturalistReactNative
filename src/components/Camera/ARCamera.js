// @flow
import { Text, View } from "components/styledComponents";
import type { Node } from "react";
import React, { useRef, useState } from "react";
import { Platform, StatusBar, StyleSheet } from "react-native";
import {
  useCameraDevices
} from "react-native-vision-camera";

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

  // Johannes (June 2023): I did read through the native code of the legacy inatcamera
  // that is triggered when using ref.current.takePictureAsync()
  // and to me it seems everything should be handled by vision-camera itself.
  // With the orientation stuff patched by the current fork.
  // However, there is also some Exif and device orientation related code
  // that I have not checked. Anyway, those parts we would hoist into JS side if not done yet.
  const camera = useRef<any>( null );

  const handleTaxaDetected = cvResults => {
    /*
      Using FrameProcessorCamera results in this as cvResults atm on Android
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
    /*
      Using FrameProcessorCamera results in this as cvResults atm on iOS (= top prediction)
      [
        {"name": "Aves", "rank": 50, "score": 0.7627944946289062, "taxon_id": 3}
      ]
    */
    console.log( "cvResults :>> ", cvResults );
    let predictions = [];
    if ( Platform.OS === "ios" ) {
      predictions = cvResults;
    } else {
      predictions = cvResults.map( result => {
        const rank = Object.keys( result )[0];
        const prediction = result[rank][0];
        prediction.rank = rank;
        return prediction;
      } );
    }
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
        <FrameProcessorCamera
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
