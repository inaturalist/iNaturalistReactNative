import { View } from "components/styledComponents";
import type { RefObject } from "react";
import React from "react";
import DeviceInfo from "react-native-device-info";
import type {
  CameraDevice, CameraPhotoOutput, CameraRef, TakePhotoOptions,
} from "react-native-vision-camera";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation";
import type { UserLocation } from "sharedHooks/useWatchPosition";

import AICamera from "./AICamera/AICamera";
import type { SavePhotoOptions } from "./CameraContainer";
import StandardCamera from "./StandardCamera/StandardCamera";

const isTablet = DeviceInfo.isTablet( );

interface Props {
  cameraType: "AI" | "Standard";
  device: CameraDevice;
  camera: RefObject<CameraRef | null>;
  flipCamera: ( ) => void;
  handleCheckmarkPress: ( ) => void;
  confirmPhotosInProgress: boolean;
  toggleFlash: ( ) => void;
  takingPhoto: boolean;
  takePhotoAndStoreUri: ( options: SavePhotoOptions ) => Promise<string>;
  newPhotoUris: string[];
  setNewPhotoUris: ( newPhotoUris: string[] ) => void;
  takePhotoOptions: TakePhotoOptions;
  userLocation: UserLocation | null;
  hasLocationPermissions: boolean;
  requestLocationPermissions: () => void;
  photoOutput: CameraPhotoOutput;
}

const CameraWithDevice = ( {
  cameraType,
  device,
  camera,
  flipCamera,
  handleCheckmarkPress,
  confirmPhotosInProgress,
  toggleFlash,
  takingPhoto,
  takePhotoAndStoreUri,
  newPhotoUris,
  setNewPhotoUris,
  takePhotoOptions,
  userLocation,
  hasLocationPermissions,
  requestLocationPermissions,
  photoOutput,
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
            device={device}
            flipCamera={flipCamera}
            handleCheckmarkPress={handleCheckmarkPress}
            confirmPhotosInProgress={confirmPhotosInProgress}
            isLandscapeMode={isLandscapeMode}
            toggleFlash={toggleFlash}
            takingPhoto={takingPhoto}
            takePhotoAndStoreUri={takePhotoAndStoreUri}
            newPhotoUris={newPhotoUris}
            setNewPhotoUris={setNewPhotoUris}
            takePhotoOptions={takePhotoOptions}
            photoOutput={photoOutput}
          />
        )
        : (
          <AICamera
            camera={camera}
            device={device}
            flipCamera={flipCamera}
            isLandscapeMode={isLandscapeMode}
            toggleFlash={toggleFlash}
            takingPhoto={takingPhoto}
            takePhotoAndStoreUri={takePhotoAndStoreUri}
            takePhotoOptions={takePhotoOptions}
            userLocation={userLocation}
            hasLocationPermissions={hasLocationPermissions}
            requestLocationPermissions={requestLocationPermissions}
            photoOutput={photoOutput}
          />
        )}
    </View>
  );
};

export default CameraWithDevice;
