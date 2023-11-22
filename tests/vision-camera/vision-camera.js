import React from "react";
// import RNFS, { writeFile } from "react-native-fs";

export class mockCamera extends React.PureComponent {
  static async getAvailableCameraDevices() {
    return [
      {
        position: "back"
      }
    ];
  }

  // I (johannes) did not use this function in the tests,
  // but it's here as in documentation in case someone needs it
  // async takePhoto() {
  //   const writePath = `${RNFS.DocumentDirectoryPath}/simulated_camera_photo.png`;

  //   const imageDataBase64 = "some_large_base_64_encoded_simulated_camera_photo";
  //   await writeFile( writePath, imageDataBase64, "base64" );

  //   return { path: writePath };
  // }

  render() {
    return null;
  }
}

export const mockSortDevices = ( _left, _right ) => 1;

// react-native-vision-camera v2
export const mockUseCameraDevices = _deviceType => {
  const devices = {
    back: {
      position: "back",
      hasFlash: true
    },
    front: {
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
    }
  };
  return devices;
};

// react-native-vision-camera v3
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
