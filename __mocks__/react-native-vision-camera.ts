import {
  mockCamera,
  mockSortDevices,
  mockUseCameraDevice,
  mockUseCameraDevices,
  mockUseCameraFormat
} from "tests/vision-camera/vision-camera";

export const Camera = mockCamera;
export const sortDevices = mockSortDevices;
export const useCameraDevice = mockUseCameraDevice;
export const useCameraDevices = mockUseCameraDevices;
export const useCameraFormat = mockUseCameraFormat;
export const VisionCameraProxy = {
  initFrameProcessorPlugin: jest.fn( )
};
export const useFrameProcessor = jest.fn( );
