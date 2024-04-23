// @flow

import { useRoute } from "@react-navigation/native";
import type { Node } from "react";
import React, {
  useState
} from "react";
import {
  useCameraDevice
} from "react-native-vision-camera";

import CameraWithDevice from "./CameraWithDevice";

const CameraContainer = ( ): Node => {
  const { params } = useRoute( );
  const addEvidence = params?.addEvidence;
  const cameraType = params?.camera;
  const [cameraPosition, setCameraPosition] = useState( "back" );
  // https://react-native-vision-camera.com/docs/guides/devices#selecting-multi-cams
  const device = useCameraDevice( cameraPosition, {
    physicalDevices: [
      "ultra-wide-angle-camera",
      "wide-angle-camera",
      "telephoto-camera"
    ]
  } );

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
