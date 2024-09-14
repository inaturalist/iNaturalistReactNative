// @flow

import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import FadeInOutView from "components/Camera/FadeInOutView";
import useRotation from "components/Camera/hooks/useRotation.ts";
import useTakePhoto from "components/Camera/hooks/useTakePhoto.ts";
import useZoom from "components/Camera/hooks/useZoom.ts";
import { Body1, INatIcon, TaxonResult } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import DeviceInfo from "react-native-device-info";
import LinearGradient from "react-native-linear-gradient";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { convertOfflineScoreToConfidence } from "sharedHelpers/convertScores.ts";
import { useDebugMode, useTranslation } from "sharedHooks";

import {
  handleCameraError,
  handleCaptureError,
  handleClassifierError,
  handleDeviceNotSupported,
  handleLog
} from "../helpers";
import AICameraButtons from "./AICameraButtons";
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
  camera: Object,
  device: Object,
  flipCamera: Function,
  handleCheckmarkPress: Function,
  isLandscapeMode: boolean
};

const AICamera = ( {
  camera,
  device,
  flipCamera,
  handleCheckmarkPress,
  isLandscapeMode
}: Props ): Node => {
  const hasFlash = device?.hasFlash;
  const { isDebug } = useDebugMode( );
  const {
    animatedProps,
    handleZoomButtonPress,
    pinchToZoom,
    showZoomButton,
    zoomTextValue,
    resetZoom
  } = useZoom( device );
  const {
    rotatableAnimatedStyle
  } = useRotation( );
  const {
    confidenceThreshold,
    fps,
    handleTaxaDetected,
    modelLoaded,
    numStoredResults,
    result,
    setResult,
    cropRatio,
    setConfidenceThreshold,
    setFPS,
    setNumStoredResults,
    setCropRatio
  } = usePredictions( );
  const {
    takePhoto,
    takePhotoOptions,
    takingPhoto,
    toggleFlash
  } = useTakePhoto( camera, false, device );
  const [inactive, setInactive] = React.useState( true );
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();

  // only show predictions when rank is order or lower, like we do on Seek
  const showPrediction = ( result && result?.taxon?.rank_level <= 40 ) || false;

  React.useEffect( () => {
    const unsubscribeBlur = navigation.addListener( "blur", () => {
      setResult( null );
      resetZoom( );
    } );

    return unsubscribeBlur;
  }, [navigation, setResult, resetZoom] );

  React.useEffect( () => {
    const unsubscribeFocus = navigation.addListener( "focus", () => {
      setResult( null );
      resetZoom( );
    } );

    return unsubscribeFocus;
  }, [navigation, setResult, resetZoom] );

  const handlePress = async ( ) => {
    await takePhoto( { replaceExisting: true, inactivateCallback: () => setInactive( true ) } );
    handleCheckmarkPress( showPrediction
      ? result
      : null );
  };

  const insets = useSafeAreaInsets( );

  return (
    <>
      {device && (
        <View className="w-full h-full absolute z-0">
          <FrameProcessorCamera
            cameraRef={camera}
            confidenceThreshold={confidenceThreshold}
            device={device}
            fps={fps}
            numStoredResults={numStoredResults}
            cropRatio={cropRatio}
            onTaxaDetected={handleTaxaDetected}
            onClassifierError={handleClassifierError}
            onDeviceNotSupported={handleDeviceNotSupported}
            onCaptureError={handleCaptureError}
            onCameraError={handleCameraError}
            onLog={handleLog}
            animatedProps={animatedProps}
            pinchToZoom={pinchToZoom}
            takingPhoto={takingPhoto}
            inactive={inactive}
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
        className="w-full h-[219px]"
      >
        <View
          className={classnames( "self-center", {
            "w-[493px]": isTablet,
            "w-[346px] top-8": !isTablet,
            "top-14": insets.top > 0
          } )}
        >
          {showPrediction && result
            ? (
              <TaxonResult
                accessibilityLabel={t( "View-suggestions" )}
                asListItem={false}
                clearBackground
                confidence={convertOfflineScoreToConfidence( result?.score )}
                handleCheckmarkPress={handlePress}
                hideNavButtons
                taxon={result?.taxon}
                testID={`AICamera.taxa.${result?.taxon?.id}`}
                white
              />
            )
            : (
              <Body1 className="text-white self-center mt-[22px]">
                {modelLoaded
                  ? t( "Scan-the-area-around-you-for-organisms" )
                  : t( "Loading-iNaturalists-AI-Camera" )}
              </Body1>
            )}
          {isDebug && result && (
            <Body1 className="text-deeppink self-center mt-[22px]">
              {`Age of result: ${Date.now() - result.timestamp}ms`}
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
      <AICameraButtons
        handleZoomButtonPress={handleZoomButtonPress}
        confidenceThreshold={confidenceThreshold}
        cropRatio={cropRatio}
        flipCamera={flipCamera}
        fps={fps}
        hasFlash={hasFlash}
        modelLoaded={modelLoaded}
        numStoredResults={numStoredResults}
        rotatableAnimatedStyle={rotatableAnimatedStyle}
        setConfidenceThreshold={setConfidenceThreshold}
        setCropRatio={setCropRatio}
        setFPS={setFPS}
        setNumStoredResults={setNumStoredResults}
        showPrediction={showPrediction}
        showZoomButton={showZoomButton}
        takePhoto={handlePress}
        takePhotoOptions={takePhotoOptions}
        takingPhoto={takingPhoto}
        toggleFlash={toggleFlash}
        zoomTextValue={zoomTextValue}
      />
    </>
  );
};

export default AICamera;
