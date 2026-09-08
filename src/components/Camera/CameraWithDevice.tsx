import type { Camera } from "components/Camera/helpers/visionCameraWrapper";
import { View } from "components/styledComponents";
import type { RefObject } from "react";
import React from "react";
import DeviceInfo from "react-native-device-info";
import type { CameraDevice, TakePhotoOptions } from "react-native-vision-camera";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation";
import type { UserLocation } from "sharedHooks/useWatchPosition";

import AICamera from "./AICamera/AICamera";
import StandardCamera from "./StandardCamera/StandardCamera";

const isTablet = DeviceInfo.isTablet( );

interface Props {
  cameraType: "AI" | "Standard";
  device: CameraDevice;
  camera: RefObject<Camera | null>;
  flipCamera: ( ) => void;
  handleCheckmarkPress: ( ) => void;
  confirmPhotosInProgress: boolean;
  toggleFlash: ( ) => void;
  takingPhoto: boolean;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  takePhotoAndStoreUri: Function;
  newPhotoUris: object[];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  setNewPhotoUris: Function;
  takePhotoOptions: TakePhotoOptions;
  userLocation: UserLocation | null;
  hasLocationPermissions: boolean;
  requestLocationPermissions: () => void;
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
          />
        )}
    </View>
  );
};

export default CameraWithDevice;
