// @flow

import { useRoute } from "@react-navigation/native";
import type { Node } from "react";
import React, {
  useState
} from "react";
// Temporarily using a fork so this is to avoid that eslint error. Need to
// remove if/when we return to the main repo
import {
  // react-native-vision-camera v3
  // useCameraDevice
  // react-native-vision-camera v2
  useCameraDevices
} from "react-native-vision-camera";

import CameraWithDevice from "./CameraWithDevice";

const CameraContainer = ( ): Node => {
  const { params } = useRoute( );
  const addEvidence = params?.addEvidence;
  const cameraType = params?.camera;
  const [cameraPosition, setCameraPosition] = useState( "back" );
  // react-native-vision-camera v3
  // const device = useCameraDevice( cameraPosition );
  // react-native-vision-camera v2
  const devices = useCameraDevices( );
  const device = devices[cameraPosition];

  if ( !device ) {
    return null;
  }

  return (
    <CameraWithDevice
      addEvidence={addEvidence}
      cameraType={cameraType}
      cameraPosition={cameraPosition}
      setCameraPosition={setCameraPosition}
      device={device}
    />
  );
};

export default CameraContainer;
