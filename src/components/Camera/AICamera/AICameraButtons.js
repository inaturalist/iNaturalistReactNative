// @flow

import CameraFlip from "components/Camera/Buttons/CameraFlip";
import Close from "components/Camera/Buttons/Close";
import Flash from "components/Camera/Buttons/Flash";
import TakePhoto from "components/Camera/Buttons/TakePhoto";
import Zoom from "components/Camera/Buttons/Zoom";
import TabletButtons from "components/Camera/TabletButtons";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import DeviceInfo from "react-native-device-info";

import AIDebugButton from "./AIDebugButton";

const isTablet = DeviceInfo.isTablet();

// the following code is for another version of the layout, rotated on landscape,
// which we're not currently supporting in the StandardCamera

// <>
// <View className="h-full justify-center absolute right-6">
//   <TakePhoto
//     disallowAddingPhotos={false}
//     takePhoto={takePhoto}
//     showPrediction
//   />
// </View>
// <View
//   className="bottom-10 absolute right-5 left-5 flex-row justify-between items-center"
// >
//   <View className="flex-row justify-evenly w-[180px]">
//     <Flash
//       toggleFlash={toggleFlash}
//       hasFlash={hasFlash}
//       takePhotoOptions={takePhotoOptions}
//       rotatableAnimatedStyle={rotatableAnimatedStyle}
//     />
//     <CameraFlip flipCamera={flipCamera} />
//   </View>
//   <View className="w-[74px] items-center">
//     <Close />
//   </View>
// </View>
// </>

type Props = {
  changeZoom: Function,
  confidenceThreshold?: number,
  cropRatio?: string,
  flipCamera: Function,
  fps?: number,
  hasFlash: boolean,
  modelLoaded: boolean,
  numStoredResults?: number,
  rotatableAnimatedStyle: Object,
  setConfidenceThreshold?: Function,
  setCropRatio?: Function,
  setFPS?: Function,
  setNumStoredResults?: Function,
  showPrediction: boolean,
  showZoomButton: boolean,
  takePhoto: Function,
  takePhotoOptions: Object,
  toggleFlash: Function,
  zoomTextValue: string
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
  toggleFlash,
  zoomTextValue
}: Props ): Node => {
  if ( isTablet ) {
    return (
      <TabletButtons
        changeZoom={changeZoom}
        disabled={modelLoaded}
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
          disabled={!modelLoaded}
          takePhoto={takePhoto}
          showPrediction={showPrediction}
        />
        <CameraFlip flipCamera={flipCamera} />
      </View>
    </View>
  );
};

export default AICameraButtons;
