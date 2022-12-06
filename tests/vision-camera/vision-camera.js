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

  static async getCameraPermissionStatus() {
    return "authorized";
  }

  static async requestCameraPermission() {
    return "authorized";
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

export const mockUseCameraDevices = _deviceType => {
  const devices = [
    {
      position: "back"
    }
  ];
  return devices;
};
