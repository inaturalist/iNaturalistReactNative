// @flow

import classnames from "classnames";
import FadeInOutView from "components/Camera/FadeInOutView";
import useRotation from "components/Camera/hooks/useRotation";
import useTakePhoto from "components/Camera/hooks/useTakePhoto";
import useZoom from "components/Camera/hooks/useZoom";
import { Body1, INatIcon, TaxonResult } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import DeviceInfo from "react-native-device-info";
import LinearGradient from "react-native-linear-gradient";
import { useTheme } from "react-native-paper";
import { convertOfflineScoreToConfidence } from "sharedHelpers/convertScores";
import { useTranslation } from "sharedHooks";

import {
  handleCameraError,
  handleCaptureError,
  handleClassifierError,
  handleDeviceNotSupported,
  handleLog
} from "../helpers";
import ARCameraButtons from "./ARCameraButtons";
import FrameProcessorCamera from "./FrameProcessorCamera";
import usePredictions from "./hooks/usePredictions";

const isTablet = DeviceInfo.isTablet();

// const exampleTaxonResult = {
//   id: 12704,
//   name: "Muscicapidae",
//   rank: "family",
//   rank_level: 30,
//   preferred_common_name: "Old World Flycatchers and Chats"
// };

type Props = {
  camera: any,
  device: any,
  flipCamera: Function,
  handleCheckmarkPress: Function,
  isLandscapeMode: boolean
};

const ARCamera = ( {
  camera,
  device,
  flipCamera,
  handleCheckmarkPress,
  isLandscapeMode
}: Props ): Node => {
  const hasFlash = device?.hasFlash;
  const {
    animatedProps,
    changeZoom,
    onZoomChange,
    onZoomStart,
    showZoomButton,
    zoomTextValue
  } = useZoom( device );
  const {
    rotatableAnimatedStyle
  } = useRotation( );
  const { result, modelLoaded, handleTaxaDetected } = usePredictions( );
  const {
    takePhoto,
    takePhotoOptions,
    takingPhoto,
    toggleFlash
  } = useTakePhoto( camera, null, device );
  const { t } = useTranslation();
  const theme = useTheme();

  // const [hasFinishedHere, setHasFinishedHere] = useState( false );
  // const localTaxon = useTaxon( result?.taxon );

  // only show predictions when rank is order or lower, like we do on Seek
  const showPrediction = ( result && result?.taxon?.rank_level <= 40 ) || false;

  // Johannes (June 2023): I did read through the native code of the legacy inatcamera
  // that is triggered when using ref.current.takePictureAsync()
  // and to me it seems everything should be handled by vision-camera itself.
  // With the orientation stuff patched by the current fork.
  // However, there is also some Exif and device orientation related code
  // that I have not checked. Anyway, those parts we would hoist into JS side if not done yet.

  const handlePress = async ( ) => {
    await takePhoto( );
    handleCheckmarkPress( showPrediction
      ? result.taxon
      : null );
  };

  // useEffect( () => {
  //   if ( hasFinishedHere ) {
  //     return;
  //   }
  //   if ( photoSaved ) {
  //     setHasFinishedHere( true );
  //     navToObsEdit( localTaxon );
  //   }
  // }, [hasFinishedHere, photoSaved, navToObsEdit, localTaxon] );

  return (
    <>
      {device && (
        <View className="w-full h-full absolute z-0">
          <FrameProcessorCamera
            cameraRef={camera}
            device={device}
            onTaxaDetected={handleTaxaDetected}
            onClassifierError={handleClassifierError}
            onDeviceNotSupported={handleDeviceNotSupported}
            onCaptureError={handleCaptureError}
            onCameraError={handleCameraError}
            onLog={handleLog}
            animatedProps={animatedProps}
            onZoomStart={onZoomStart}
            onZoomChange={onZoomChange}
            takingPhoto={takingPhoto}
          />
        </View>
      )}
      <LinearGradient
        colors={["#000000", "rgba(0, 0, 0, 0)"]}
        locations={[
          0.001,
          isTablet && isLandscapeMode
            ? 0.3
            : 1
        ]}
        className="w-full"
      >
        <View
          className={classnames( "self-center h-[219px]", {
            "w-[493px]": isTablet,
            "pt-8 w-[346px]": !isTablet
          } )}
        >
          {showPrediction && result
            ? (
              <TaxonResult
                taxon={result?.taxon}
                handleCheckmarkPress={handlePress}
                testID={`ARCamera.taxa.${result?.taxon?.id}`}
                clearBackground
                confidence={convertOfflineScoreToConfidence( result?.score )}
                white
              />
            )
            : (
              <Body1 className="text-white self-center mt-[22px]">
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
      <FadeInOutView takingPhoto={takingPhoto} />
      <ARCameraButtons
        takePhoto={handlePress}
        rotatableAnimatedStyle={rotatableAnimatedStyle}
        toggleFlash={toggleFlash}
        flipCamera={flipCamera}
        hasFlash={hasFlash}
        takePhotoOptions={takePhotoOptions}
        showPrediction={showPrediction}
        zoomTextValue={zoomTextValue}
        showZoomButton={showZoomButton}
        changeZoom={changeZoom}
      />
    </>
  );
};

export default ARCamera;
