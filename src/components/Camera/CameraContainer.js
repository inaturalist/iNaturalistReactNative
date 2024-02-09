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
  const backToObsEdit = params?.backToObsEdit;
  const addEvidence = params?.addEvidence;
  const cameraType = params?.camera;
  const [cameraPosition, setCameraPosition] = useState( "back" );
  const device = useCameraDevice( cameraPosition );

  if ( !device ) {
    return null;
  }

  return (
    <CameraWithDevice
      backToObsEdit={backToObsEdit}
      addEvidence={addEvidence}
      cameraType={cameraType}
      cameraPosition={cameraPosition}
      setCameraPosition={setCameraPosition}
      device={device}
    />
  );
};

export default CameraContainer;
