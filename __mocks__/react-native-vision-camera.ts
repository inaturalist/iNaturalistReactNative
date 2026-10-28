import {
  mockCamera,
  mockSortDevices,
  mockUseAsyncRunner,
  mockUseCameraDevice,
  mockUseCameraDevices,
  mockUsePhotoOutput,
} from "tests/vision-camera/vision-camera";

export const Camera = mockCamera;
export const sortDevices = mockSortDevices;
export const useAsyncRunner = mockUseAsyncRunner;
export const useCameraDevice = mockUseCameraDevice;
export const useCameraDevices = mockUseCameraDevices;
export const useFrameOutput = jest.fn( );
export const usePhotoOutput = mockUsePhotoOutput;
