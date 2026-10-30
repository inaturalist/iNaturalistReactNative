import { View } from "components/styledComponents";
import type { RefObject } from "react";
import React from "react";
import DeviceInfo from "react-native-device-info";
import type {
  CameraDevice, CameraPhotoOutput, CameraRef, CapturePhotoSettings,
} from "react-native-vision-camera";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation";
import type { UserLocation } from "sharedHooks/useWatchPosition";

import AICamera from "./AICamera/AICamera";
import type { SavePhotoOptions } from "./CameraContainer";
import StandardCamera from "./StandardCamera/StandardCamera";

const isTablet = DeviceInfo.isTablet( );

interface Props {
  camera: RefObject<CameraRef | null>;
  cameraType: "AI" | "Standard";
  confirmPhotosInProgress: boolean;
  device: CameraDevice;
  flipCamera: ( ) => void;
  handleCheckmarkPress: ( ) => void;
  hasLocationPermissions: boolean;
  newPhotoUris: string[];
  photoOutput: CameraPhotoOutput;
  requestLocationPermissions: () => void;
  setNewPhotoUris: ( newPhotoUris: string[] ) => void;
  takePhotoAndStoreUri: ( options: SavePhotoOptions ) => Promise<string>;
  takePhotoOptions: CapturePhotoSettings;
  takingPhoto: boolean;
  toggleFlash: ( ) => void;
  userLocation: UserLocation | null;
}

const CameraWithDevice = ( {
  camera,
  cameraType,
  confirmPhotosInProgress,
  device,
  flipCamera,
  handleCheckmarkPress,
  hasLocationPermissions,
  newPhotoUris,
  photoOutput,
  requestLocationPermissions,
  setNewPhotoUris,
  takePhotoAndStoreUri,
  takePhotoOptions,
  takingPhoto,
  toggleFlash,
  userLocation,
}: Props ) => {
  const { isLandscapeMode } = useDeviceOrientation( );
  const flexDirection = isTablet && isLandscapeMode
    ? "flex-row"
    : "flex-col";

  return (
    <View
      className={`flex-1 bg-black ${flexDirection}`}
      testID="CameraWithDevice"
    >
      {cameraType === "Standard"
        ? (
          <StandardCamera
            camera={camera}
            confirmPhotosInProgress={confirmPhotosInProgress}
            device={device}
            flipCamera={flipCamera}
            handleCheckmarkPress={handleCheckmarkPress}
            isLandscapeMode={isLandscapeMode}
            newPhotoUris={newPhotoUris}
            photoOutput={photoOutput}
            setNewPhotoUris={setNewPhotoUris}
            takePhotoAndStoreUri={takePhotoAndStoreUri}
            takePhotoOptions={takePhotoOptions}
            takingPhoto={takingPhoto}
            toggleFlash={toggleFlash}
          />
        )
        : (
          <AICamera
            camera={camera}
            device={device}
            flipCamera={flipCamera}
            hasLocationPermissions={hasLocationPermissions}
            isLandscapeMode={isLandscapeMode}
            photoOutput={photoOutput}
            requestLocationPermissions={requestLocationPermissions}
            takePhotoAndStoreUri={takePhotoAndStoreUri}
            takePhotoOptions={takePhotoOptions}
            takingPhoto={takingPhoto}
            toggleFlash={toggleFlash}
            userLocation={userLocation}
          />
        )}
    </View>
  );
};

export default CameraWithDevice;
