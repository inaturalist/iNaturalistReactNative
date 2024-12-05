// @flow

import classnames from "classnames";
import FadeInOutView from "components/Camera/FadeInOutView";
import useRotation from "components/Camera/hooks/useRotation.ts";
import useZoom from "components/Camera/hooks/useZoom.ts";
import { Body1, INatIcon, TaxonResult } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback, useEffect, useState } from "react";
import DeviceInfo from "react-native-device-info";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VolumeManager } from "react-native-volume-manager";
import { convertOfflineScoreToConfidence } from "sharedHelpers/convertScores.ts";
import { log } from "sharedHelpers/logger";
import {
  useDebugMode, usePerformance, useTranslation
} from "sharedHooks";
import { isDebugMode } from "sharedHooks/useDebugMode";
import colors from "styles/tailwindColors";

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

const logger = log.extend( "AICamera" );

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
  isLandscapeMode: boolean,
  toggleFlash: Function,
  takingPhoto: boolean,
  takePhotoAndStoreUri: Function,
  takePhotoOptions: Object,
  setAiSuggestion: Function
};

const AICamera = ( {
  camera,
  device,
  flipCamera,
  handleCheckmarkPress,
  isLandscapeMode,
  toggleFlash,
  takingPhoto,
  takePhotoAndStoreUri,
  takePhotoOptions,
  setAiSuggestion
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
    taxonomyRollupCutoff,
    fps,
    handleTaxaDetected,
    modelLoaded,
    numStoredResults,
    result,
    setResult,
    cropRatio,
    setConfidenceThreshold,
    setTaxonomyRollupCutoff,
    setFPS,
    setNumStoredResults,
    setCropRatio
  } = usePredictions( );
  const [inactive, setInactive] = React.useState( false );
  const [initialVolume, setInitialVolume] = useState( null );

  const { t } = useTranslation();

  const { loadTime } = usePerformance( {
    isLoading: camera?.current !== null
  } );
  if ( isDebugMode( ) && loadTime ) {
    logger.info( loadTime );
  }

  const resetCameraOnFocus = useCallback( ( ) => {
    setResult( null );
    resetZoom( );
  }, [resetZoom, setResult] );

  // only show predictions when rank is order or lower, like we do on Seek
  const showPrediction = ( result && result?.taxon?.rank_level <= 40 ) || false;

  const insets = useSafeAreaInsets( );

  const onFlipCamera = () => {
    resetZoom( );
    flipCamera( );
  };

  const handleTakePhoto = useCallback( async ( ) => {
    setAiSuggestion( showPrediction && result );
    await takePhotoAndStoreUri( {
      replaceExisting: true,
      inactivateCallback: () => setInactive( true ),
      navigateImmediately: true
    } );
  }, [setAiSuggestion, takePhotoAndStoreUri, result, showPrediction] );

  useEffect( () => {
    if ( initialVolume === null ) {
      // Fetch the current volume to set the initial state
      VolumeManager.getVolume()
        .then( volume => {
          setInitialVolume( volume.volume );
        } );
    }

    const volumeListener = VolumeManager.addVolumeListener( ( ) => {
      if ( initialVolume !== null ) {
        // Hardware volume button pressed - take a photo
        handleTakePhoto();

        // Revert the volume to its previous state
        VolumeManager.setVolume( initialVolume );
      }
    } );

    // Suppress the native volume UI
    VolumeManager.showNativeVolumeUI( { enabled: false } );

    return () => {
      volumeListener.remove();
      VolumeManager.showNativeVolumeUI( { enabled: true } );
    };
  }, [handleTakePhoto, initialVolume] );

  return (
    <>
      {device && (
        <View className="w-full h-full absolute z-0">
          <FrameProcessorCamera
            cameraRef={camera}
            confidenceThreshold={confidenceThreshold}
            taxonomyRollupCutoff={taxonomyRollupCutoff}
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
            resetCameraOnFocus={resetCameraOnFocus}
          />
        </View>
      )}
      <LinearGradient
        colors={[colors.black, "rgba(0, 0, 0, 0)"]}
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
                handleCheckmarkPress={handleCheckmarkPress}
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
              color={colors.white}
            />
          </View>
        </View>
      )}
      <FadeInOutView takingPhoto={takingPhoto} />
      <AICameraButtons
        handleZoomButtonPress={handleZoomButtonPress}
        confidenceThreshold={confidenceThreshold}
        taxonomyRollupCutoff={taxonomyRollupCutoff}
        cropRatio={cropRatio}
        flipCamera={onFlipCamera}
        fps={fps}
        hasFlash={hasFlash}
        modelLoaded={modelLoaded}
        numStoredResults={numStoredResults}
        rotatableAnimatedStyle={rotatableAnimatedStyle}
        setConfidenceThreshold={setConfidenceThreshold}
        setTaxonomyRollupCutoff={setTaxonomyRollupCutoff}
        setCropRatio={setCropRatio}
        setFPS={setFPS}
        setNumStoredResults={setNumStoredResults}
        showPrediction={showPrediction}
        showZoomButton={showZoomButton}
        takePhoto={handleTakePhoto}
        takePhotoOptions={takePhotoOptions}
        takingPhoto={takingPhoto}
        toggleFlash={toggleFlash}
        zoomTextValue={zoomTextValue}
      />
    </>
  );
};

export default AICamera;
