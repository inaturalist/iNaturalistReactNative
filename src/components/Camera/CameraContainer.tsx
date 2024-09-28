import { useNavigation, useRoute } from "@react-navigation/native";
import {
  useCameraDevice
} from "components/Camera/helpers/visionCameraWrapper";
import React, {
  useState
} from "react";
import { Alert } from "react-native";
import { useTranslation } from "sharedHooks";

import CameraWithDevice from "./CameraWithDevice";

const CameraContainer = ( ) => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const { params } = useRoute( );
  const addEvidence = params?.addEvidence;
  const cameraType = params?.camera;
  const [cameraPosition, setCameraPosition] = useState<"front" | "back">( "back" );
  // https://react-native-vision-camera.com/docs/guides/devices#selecting-multi-cams
  const device = useCameraDevice( cameraPosition, {
    physicalDevices: [
      "ultra-wide-angle-camera",
      "wide-angle-camera",
      "telephoto-camera"
    ]
  } );

  if ( !device ) {
    Alert.alert(
      t( "No-Camera-Available" ),
      t( "Could-not-find-a-camera-on-this-device" )
    );
    navigation.goBack();
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
