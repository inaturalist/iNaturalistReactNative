// @flow

import classnames from "classnames";
import FadeInOutView from "components/Camera/FadeInOutView";
import { Body1, INatIcon, TaxonResult } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import LinearGradient from "react-native-linear-gradient";
import { useTheme } from "react-native-paper";
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

const isTablet = DeviceInfo.isTablet();

// const exampleTaxonResult = {
//   id: 12704,
//   name: "Muscicapidae",
//   rank: "family",
//   rank_level: 30,
//   preferred_common_name: "Old World Flycatchers and Chats"
// };

type Props = {
  flipCamera: Function,
  toggleFlash: Function,
  takePhoto: Function,
  rotatableAnimatedStyle: Object,
  device: any,
  camera: any,
  hasFlash: boolean,
  takePhotoOptions: Object,
  takingPhoto: boolean,
  animatedProps: any,
  changeZoom: Function,
  zoomTextValue: string,
  showZoomButton: boolean,
  navToObsEdit: Function,
  photoSaved: boolean,
  onZoomStart?: Function,
  onZoomChange?: Function,
};

const ARCamera = ( {
  flipCamera,
  toggleFlash,
  takePhoto,
  rotatableAnimatedStyle,
  device,
  camera,
  hasFlash,
  takePhotoOptions,
  takingPhoto,
  animatedProps,
  changeZoom,
  zoomTextValue,
  showZoomButton,
  navToObsEdit,
  photoSaved,
  onZoomStart,
  onZoomChange
}: Props ): Node => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [result, setResult] = useState( null );
  const [modelLoaded, setModelLoaded] = useState( false );
  const [hasFinishedHere, setHasFinishedHere] = useState( false );

  // only show predictions when rank is order or lower, like we do on Seek
  const showPrediction = ( result && result.rank_level <= 40 ) || false;

  // Johannes (June 2023): I did read through the native code of the legacy inatcamera
  // that is triggered when using ref.current.takePictureAsync()
  // and to me it seems everything should be handled by vision-camera itself.
  // With the orientation stuff patched by the current fork.
  // However, there is also some Exif and device orientation related code
  // that I have not checked. Anyway, those parts we would hoist into JS side if not done yet.

  const convertScoreToConfidence = score => {
    if ( !score ) {
      return null;
    }
    if ( score < 0.2 ) {
      return 1;
    }
    if ( score < 0.4 ) {
      return 2;
    }
    if ( score < 0.6 ) {
      return 3;
    }
    if ( score < 0.8 ) {
      return 4;
    }
    return 5;
  };

  const handleTaxaDetected = cvResults => {
    if ( cvResults && !modelLoaded ) {
      setModelLoaded( true );
    }
    /*
      Using FrameProcessorCamera results in this as cvResults atm on Android
      [
        {
          "stateofmatter": [
            {"ancestor_ids": [Array], "name": xx, "rank": xx, "score": xx, "taxon_id": xx}
          ]
        },
        {
          "order": [
            {"ancestor_ids": [Array], "name": xx, "rank": xx, "score": xx, "taxon_id": xx}
          ]
        },
        {
          "species": [
            {"ancestor_ids": [Array], "name": xx, "rank": xx, "score": xx, "taxon_id": xx}
          ]
        }
      ]
    */
    /*
      Using FrameProcessorCamera results in this as cvResults atm on iOS (= top prediction)
      [
        {"name": "Aves", "rank": 50, "score": 0.7627944946289062, "taxon_id": 3}
      ]
    */
    // console.log( "cvResults :>> ", cvResults );
    let prediction = null;
    let predictions = [];
    if ( Platform.OS === "ios" ) {
      if ( cvResults.length > 0 ) {
        const finestPrediction = cvResults[cvResults.length - 1];
        prediction = {
          rank_level: finestPrediction.rank,
          id: finestPrediction.taxon_id,
          name: finestPrediction.name,
          score: finestPrediction.score
        };
      }
    } else {
      predictions = cvResults
        ?.map( r => {
          const rank = Object.keys( r )[0];
          return r[rank][0];
        } )
        .sort( ( a, b ) => a.rank - b.rank );
      prediction = predictions
        && predictions.length > 0 && {
        rank_level: predictions[0].rank,
        id: predictions[0].taxon_id,
        name: predictions[0].name,
        score: predictions[0].score
      };
    }
    setResult( prediction );
  };

  useEffect( () => {
    if ( hasFinishedHere ) {
      return;
    }
    if ( photoSaved ) {
      setHasFinishedHere( true );
      navToObsEdit( { prediction: result } );
    }
  }, [hasFinishedHere, photoSaved, navToObsEdit, result] );

  return (
    <>
      {device && (
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
      )}
      <LinearGradient
        colors={["#000000", "rgba(0, 0, 0, 0)"]}
        locations={[0.001, 1]}
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
                taxon={result}
                handleCheckmarkPress={takePhoto}
                testID={`ARCamera.taxa.${result.id}`}
                clearBackground
                confidence={convertScoreToConfidence( result?.score )}
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
        takePhoto={takePhoto}
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
