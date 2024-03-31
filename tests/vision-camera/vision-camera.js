import React from "react";
import { View } from "react-native";
import RNFS, { writeFile } from "react-native-fs";

export class mockCamera extends React.PureComponent {
  static async getAvailableCameraDevices() {
    return [
      {
        position: "back"
      }
    ];
  }

  // eslint-disable-next-line class-methods-use-this, react/no-unused-class-component-methods
  async takePhoto( ) {
    const writePath = `${RNFS.DocumentDirectoryPath}/simulated_camera_photo.png`;

    const imageDataBase64 = "some_large_base_64_encoded_simulated_camera_photo";
    await writeFile( writePath, imageDataBase64, "base64" );

    return { path: writePath };
  }

  render() {
    return <View />;
  }
}

export const mockSortDevices = ( _left, _right ) => 1;

export const mockUseCameraDevice = _deviceType => {
  const device = {
    devices: ["wide-angle-camera"],
    hasFlash: true,
    hasTorch: true,
    id: "1",
    isMultiCam: true,
    maxZoom: 12.931958198547363,
    minZoom: 1,
    name: "front (1)",
    neutralZoom: 1,
    position: "front",
    supportsDepthCapture: false,
    supportsFocus: true,
    supportsLowLightBoost: false,
    supportsParallelVideoProcessing: true,
    supportsRawCapture: true
  };
  return device;
};
