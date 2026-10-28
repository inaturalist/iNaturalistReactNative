import {
  mockCamera,
  mockSortDevices,
  mockUseCameraDevice,
  mockUseCameraDevices,
} from "tests/vision-camera/vision-camera";

export const Camera = mockCamera;
export const sortDevices = mockSortDevices;
export const useCameraDevice = mockUseCameraDevice;
export const useCameraDevices = mockUseCameraDevices;
export const useFrameProcessor = jest.fn( );
