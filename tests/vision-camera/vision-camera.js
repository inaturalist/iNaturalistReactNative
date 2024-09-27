import React from "react";
import { View } from "react-native";
import RNFS, { writeFile } from "react-native-fs";

const mockFrame = {
  isValid: true,
  width: 1920,
  height: 1080,
  bytesPerRow: 1920,
  planesCount: 1,
  isMirrored: false,
  timestamp: 0,
  orientation: "portrait",
  pixelFormat: "yuv",
  // Returns a fake ArrayBuffer
  toArrayBuffer: () => new ArrayBuffer( 1920 * 1080 ),
  toString: () => "Frame",
  getNativeBuffer: () => ( {
    // Returns a fake pointer
    pointer: 0,
    delete: () => null
  } ),
  incrementRefCount: () => null,
  decrementRefCount: () => null
};

const style = { flex: 1, backgroundColor: "red" };
export class mockCamera extends React.PureComponent {
  static async getAvailableCameraDevices() {
    return [
      {
        position: "back"
      }
    ];
  }

  componentDidUpdate() {
    const { frameProcessor } = this.props;
    frameProcessor?.frameProcessor( mockFrame );
  }

  // eslint-disable-next-line class-methods-use-this, react/no-unused-class-component-methods
  async takePhoto( ) {
    const writePath = `${RNFS.DocumentDirectoryPath}/simulated_camera_photo.png`;

    const imageDataBase64 = "some_large_base_64_encoded_simulated_camera_photo";
    await writeFile( writePath, imageDataBase64, "base64" );

    return { path: writePath };
  }

  render() {
    return <View style={style} />;
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

export const mockUseCameraFormat = _device => {
  const format = {
    autoFocusSystem: "contrast-detection",
    fieldOfView: 83.97117848314457,
    maxFps: 60,
    maxISO: 11377,
    minFps: 15,
    minISO: 44,
    photoHeight: 3024,
    photoWidth: 4032,
    pixelFormats: ["yuv", "native"],
    supportsDepthCapture: false,
    supportsPhotoHdr: false,
    supportsVideoHdr: false,
    videoHeight: 2160,
    videoStabilizationModes: ["off", "cinematic", "cinematic-extended"],
    videoWidth: 3840
  };
  return format;
};
