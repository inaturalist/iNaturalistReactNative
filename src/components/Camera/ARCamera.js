// @flow

import classnames from "classnames";
import { Body1, INatIcon, TaxonResult } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import {
  Platform
} from "react-native";
import DeviceInfo from "react-native-device-info";
import LinearGradient from "react-native-linear-gradient";
import { useTheme } from "react-native-paper";
import { useTranslation } from "sharedHooks";

import ARCameraButtons from "./ARCameraButtons";
import CameraView from "./CameraView";
import FadeInOutView from "./FadeInOutView";

const isTablet = DeviceInfo.isTablet();

export const MAX_PHOTOS_ALLOWED = 20;

// TODO: eventually, these values will be predictions that come back from AR Camera
const exampleTaxon = {
  id: 12704,
  name: "Muscicapidae",
  rank: "family",
  rank_level: 30,
  preferred_common_name: "Old World Flycatchers and Chats"
};

// TODO: eventually, we'll be able to calculate a score from 1-5 confidence from predictions
const exampleConfidence = 4;

// only show predictions when rank is order or lower, like we do on Seek
const showPrediction = exampleTaxon.rank_level <= 40;

// TODO: get value from native AR camera
const modelLoaded = true;

type Props = {
  flipCamera: Function,
  toggleFlash: Function,
  takePhoto: Function,
  rotatableAnimatedStyle: Object,
  device: any,
  camera: any,
  deviceOrientation: string,
  hasFlash: boolean,
  takePhotoOptions: Object,
  savingPhoto: boolean
}

const ARCamera = ( {
  flipCamera,
  toggleFlash,
  takePhoto,
  rotatableAnimatedStyle,
  device,
  camera,
  deviceOrientation,
  hasFlash,
  takePhotoOptions,
  savingPhoto
}: Props ): Node => {
  const { t } = useTranslation( );
  const theme = useTheme( );

  return (
    <>
      {device && (
        <CameraView
          device={device}
          camera={camera}
          orientation={
          // In Android the camera won't set the orientation metadata
          // correctly without this, but in iOS it won't display the
          // preview correctly *with* it
            Platform.OS === "android"
              ? deviceOrientation
              : null
          }
        />
      )}
      <LinearGradient
        colors={["#000000", "rgba(0, 0, 0, 0)"]}
        locations={[0.001, 1]}
        className="w-full"
      >
        <View className={
          classnames( "self-center h-[219px]", {
            "w-[493px]": isTablet,
            "pt-8 w-[346px]": !isTablet
          } )
        }
        >
          {showPrediction
            ? (
              <TaxonResult
                taxon={exampleTaxon}
                handleCheckmarkPress={( ) => { }}
                testID={`ARCamera.taxa.${exampleTaxon.id}`}
                clearBackground
                confidence={exampleConfidence}
              />
            )
            : (
              <Body1
                className="text-white self-center mt-[22px]"
              >
                {modelLoaded
                  ? t( "Scan-the-area-around-you-for-organisms" )
                  : t( "Loading-iNaturalists-AR-Camera" )}
              </Body1>
            )}
        </View>
      </LinearGradient>
      {!modelLoaded && (
        <View className="absolute left-1/2 top-1/2">
          <View className="right-[57px] bottom-[57px]">
            <INatIcon
              name="inaturalist"
              size={114}
              color={theme.colors.onPrimary}
            />
          </View>
        </View>
      )}
      <FadeInOutView savingPhoto={savingPhoto} />
      <ARCameraButtons
        takePhoto={takePhoto}
        rotatableAnimatedStyle={rotatableAnimatedStyle}
        toggleFlash={toggleFlash}
        flipCamera={flipCamera}
        hasFlash={hasFlash}
        takePhotoOptions={takePhotoOptions}
        showPrediction={showPrediction}
      />
    </>
  );
};

export default ARCamera;
