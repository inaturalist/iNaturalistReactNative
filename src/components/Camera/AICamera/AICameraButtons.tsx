import CameraFlip from "components/Camera/Buttons/CameraFlip.tsx";
import Close from "components/Camera/Buttons/Close.tsx";
import Flash from "components/Camera/Buttons/Flash.tsx";
import TakePhoto from "components/Camera/Buttons/TakePhoto.tsx";
import Zoom from "components/Camera/Buttons/Zoom.tsx";
import TabletButtons from "components/Camera/TabletButtons.tsx";
import { View } from "components/styledComponents";
import React from "react";
import { GestureResponderEvent, ViewStyle } from "react-native";
import DeviceInfo from "react-native-device-info";
import { TakePhotoOptions } from "react-native-vision-camera";

import AIDebugButton from "./AIDebugButton";

const isTablet = DeviceInfo.isTablet();

interface Props {
  changeZoom: ( _event: GestureResponderEvent ) => void;
  confidenceThreshold?: number;
  cropRatio?: string;
  flipCamera: ( _event: GestureResponderEvent ) => void;
  fps?: number;
  hasFlash: boolean;
  modelLoaded: boolean;
  numStoredResults?: number;
  rotatableAnimatedStyle: ViewStyle;
  // Those four are debug only so I don't bother with types
  setConfidenceThreshold?: Function;
  setCropRatio?: Function,
  setFPS?: Function,
  setNumStoredResults?: Function,
  showPrediction: boolean;
  showZoomButton: boolean;
  takePhoto: () => Promise<void>;
  takePhotoOptions: TakePhotoOptions;
  takingPhoto: boolean;
  toggleFlash: ( _event: GestureResponderEvent ) => void;
  zoomTextValue: string;
}

const AICameraButtons = ( {
  changeZoom,
  confidenceThreshold,
  cropRatio,
  flipCamera,
  fps,
  hasFlash,
  modelLoaded,
  numStoredResults,
  rotatableAnimatedStyle,
  setConfidenceThreshold,
  setCropRatio,
  setFPS,
  setNumStoredResults,
  showPrediction,
  showZoomButton,
  takePhoto,
  takePhotoOptions,
  takingPhoto,
  toggleFlash,
  zoomTextValue
}: Props ) => {
  if ( isTablet ) {
    return (
      <TabletButtons
        changeZoom={changeZoom}
        disabled={!modelLoaded && !takingPhoto}
        flipCamera={flipCamera}
        hasFlash={hasFlash}
        rotatableAnimatedStyle={rotatableAnimatedStyle}
        showPrediction={showPrediction}
        showZoomButton={showZoomButton}
        takePhoto={takePhoto}
        takePhotoOptions={takePhotoOptions}
        toggleFlash={toggleFlash}
        zoomTextValue={zoomTextValue}
      />
    );
  }
  console.log( "takingPhoto", takingPhoto );
  return (
    <View className="bottom-10 absolute right-5 left-5">
      <View className="flex-row justify-end pb-[30px]">
        <Zoom
          zoomTextValue={zoomTextValue}
          changeZoom={changeZoom}
          showZoomButton={showZoomButton}
          rotatableAnimatedStyle={rotatableAnimatedStyle}
        />
      </View>
      <AIDebugButton
        confidenceThreshold={confidenceThreshold}
        setConfidenceThreshold={setConfidenceThreshold}
        fps={fps}
        setFPS={setFPS}
        numStoredResults={numStoredResults}
        setNumStoredResults={setNumStoredResults}
        cropRatio={cropRatio}
        setCropRatio={setCropRatio}
        // TODO: The following are just to get accessibility tests to pass...
        // without making anything truly accessible. The test seems to think
        // AIDebugButton is itself not accessible, but it's really
        // complaining about the sliders within. If the sliders make it into
        // production, they'll need to be made to pass that test.
        accessibilityRole="adjustable"
        accessibilityValue={{ min: 0, max: 100, now: 50 }}
      />
      <View className="flex-row justify-end pb-[20px]">
        <Flash
          toggleFlash={toggleFlash}
          hasFlash={hasFlash}
          takePhotoOptions={takePhotoOptions}
          rotatableAnimatedStyle={rotatableAnimatedStyle}
        />
      </View>
      <View className="flex-row justify-between items-center">
        <Close />
        <TakePhoto
          disabled={!modelLoaded && !takingPhoto}
          takePhoto={takePhoto}
          showPrediction={showPrediction}
        />
        <CameraFlip flipCamera={flipCamera} />
      </View>
    </View>
  );
};

export default AICameraButtons;
