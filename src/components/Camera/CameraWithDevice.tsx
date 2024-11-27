import { View } from "components/styledComponents";
import React from "react";
import DeviceInfo from "react-native-device-info";
import type { CameraDevice } from "react-native-vision-camera";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation.ts";
import { UserLocation } from "sharedHooks/useWatchPosition.ts";

import AICamera from "./AICamera/AICamera";
import StandardCamera from "./StandardCamera/StandardCamera";

const isTablet = DeviceInfo.isTablet( );

interface Props {
  cameraType: string,
  device: CameraDevice,
  camera: Object,
  flipCamera: ( ) => void,
  handleCheckmarkPress: ( ) => void,
  toggleFlash: Function,
  takingPhoto: boolean,
  takePhotoAndStoreUri: Function,
  newPhotoUris: Array<Object>,
  setNewPhotoUris: Function,
  takePhotoOptions: Object,
  setAiSuggestion: Function,
  userLocation: UserLocation | null
}

const CameraWithDevice = ( {
  cameraType,
  device,
  camera,
  flipCamera,
  handleCheckmarkPress,
  toggleFlash,
  takingPhoto,
  takePhotoAndStoreUri,
  newPhotoUris,
  setNewPhotoUris,
  takePhotoOptions,
  setAiSuggestion,
  userLocation
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
            handleCheckmarkPress={handleCheckmarkPress}
            isLandscapeMode={isLandscapeMode}
            toggleFlash={toggleFlash}
            takingPhoto={takingPhoto}
            takePhotoAndStoreUri={takePhotoAndStoreUri}
            takePhotoOptions={takePhotoOptions}
            setAiSuggestion={setAiSuggestion}
            userLocation={userLocation}
          />
        )}
    </View>
  );
};

export default CameraWithDevice;
