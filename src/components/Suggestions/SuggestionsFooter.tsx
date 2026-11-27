import {
  Body1,
  Body3,
  Body4,
  Button,
  Heading4,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import Attribution from "components/Suggestions/Attribution";
import React from "react";
import { useDebugMode, useTranslation } from "sharedHooks";
import type {
  OnlineSuggestionsQueryResponse,
} from "sharedHooks/useSuggestions/useOnlineSuggestions";
import type { OfflineStatus, OnlineStatus } from "sharedHooks/useSuggestions/useSuggestionsV2";

interface Props {
  debugData: {
    onlineStatus: OnlineStatus;
    offlineStatus: OfflineStatus;
    onlineError?: Error;
    offlineError?: Error;
    onlineSuggestions?: OnlineSuggestionsQueryResponse;
    selectedPhotoUri: string;
    shouldUseEvidenceLocation: boolean;
    topSuggestionType: string;
    usingOfflineSuggestions: boolean;
    suggestions: {
      otherSuggestions: [];
      topSuggestion: {
        taxon: {
          id: number;
          name: string;
        };
        combined_score: number;
      };
    };
  };
  handleSkip: ( ) => void;
  hideLocationToggleButton: boolean;
  hideSkip?: boolean;
  observers: string[];
  // Offers cropping the selected photo when this is passed
  onCropPhoto?: ( ) => void;
  shouldUseEvidenceLocation: boolean;
  toggleLocation: ( options: { showLocation: boolean } ) => void;
}

const SuggestionsFooter = ( {
  debugData,
  handleSkip,
  hideLocationToggleButton,
  hideSkip,
  observers,
  onCropPhoto,
  shouldUseEvidenceLocation,
  toggleLocation,
}: Props ) => {
  const { t } = useTranslation( );
  const { isDebug } = useDebugMode( );

  return (
    <View className="mb-9">
      {( !hideLocationToggleButton || onCropPhoto ) && (
        <View className="px-4 py-6">
          {!hideLocationToggleButton && (
            shouldUseEvidenceLocation
              ? (
                <Button
                  text={t( "IGNORE-LOCATION" )}
                  onPress={( ) => toggleLocation( { showLocation: false } )}
                  accessibilityLabel={t( "Search-suggestions-without-location" )}
                />
              )
              : (
                <Button
                  text={t( "USE-LOCATION" )}
                  onPress={( ) => toggleLocation( { showLocation: true } )}
                  accessibilityLabel={t( "Search-suggestions-with-location" )}
                />
              )
          )}
          {onCropPhoto && (
            <Button
              className={!hideLocationToggleButton
                ? "mt-4"
                : undefined}
              text={t( "CROP-PHOTO" )}
              onPress={onCropPhoto}
              accessibilityLabel={t( "Crop-photo" )}
            />
          )}
        </View>
      )}
      {!hideLocationToggleButton && <Attribution observers={observers} />}
      { !hideSkip && (
        <Body1
          className="underline text-center py-6"
          onPress={handleSkip}
          accessibilityRole="link"
          accessibilityHint={t( "Navigates-to-observation-edit-screen" )}
        >
          {t( "Add-an-ID-Later" )}
        </Body1>
      ) }
      {/* eslint-disable i18next/no-literal-string */}
      {/* eslint-disable react/jsx-one-expression-per-line */}
      {/* eslint-disable max-len */}
      { isDebug && (
        <View className="bg-deeppink text-white p-3">
          <Heading4 className="text-white">Diagnostics</Heading4>
          <Body3 className="text-white">Online status: {JSON.stringify( debugData?.onlineStatus )}</Body3>
          <Body3 className="text-white">Offline status: {JSON.stringify( debugData?.offlineStatus )}</Body3>
          <Body3 className="text-white">Online suggestions URI: {JSON.stringify( debugData?.selectedPhotoUri )}</Body3>
          <Body3 className="text-white">Online suggestions using location: {JSON.stringify( debugData?.shouldUseEvidenceLocation )}</Body3>
          <Body3 className="text-white">Top suggestion type: {JSON.stringify( debugData?.topSuggestionType )}</Body3>
          <Body3 className="text-white">Num online suggestions: {JSON.stringify( debugData?.onlineSuggestions?.results.length )}</Body3>
          <Body3 className="text-white">Using offline suggestions: {JSON.stringify( debugData?.usingOfflineSuggestions )}</Body3>
          <Body3 className="text-white">Error loading online: {JSON.stringify( debugData?.onlineError?.message )}</Body3>
          <Body3 className="text-white">Error loading offline: {JSON.stringify( debugData?.offlineError?.message )}</Body3>
          { debugData?.usingOfflineSuggestions && (
            <View className="mb-3">
              <Body3 className="text-white">Offline Scores</Body3>
              <View className="flex-row border-b border-white">
                <Body4 className="text-white grow">Taxon</Body4>
                <Body4 className="text-white w-[20%]">Score</Body4>
              </View>
              { debugData.suggestions?.otherSuggestions?.filter( Boolean ).map( suggestion => (
                <View key={`sugg-debug-${suggestion.taxon.id}`} className="flex-row">
                  <Body4 className="text-white grow">{suggestion.taxon.name}</Body4>
                  <Body4 className="text-white w-[20%]">{Number( suggestion.combined_score ).toFixed( 4 )}</Body4>
                </View>
              ) )}
            </View>
          )}
          { debugData.onlineSuggestions?.results && (
            <>
              <Body3 className="text-white">Online Scores:</Body3>
              <View className="flex-row border-b border-white">
                <Body4 className="text-white grow">Taxon</Body4>
                <Body4 className="text-white w-[20%]">Combined</Body4>
                <Body4 className="text-white w-[20%]">Vision</Body4>
              </View>
              { debugData.onlineSuggestions?.results?.filter( Boolean ).map( suggestion => (
                <View key={`sugg-debug-${suggestion.taxon.id}`} className="flex-row">
                  <Body4 className="text-white grow">{suggestion.taxon.name}</Body4>
                  <Body4 className="text-white w-[20%]">{Number( suggestion.combined_score ).toFixed( 4 )}</Body4>
                  <Body4 className="text-white w-[20%]">{Number( suggestion.vision_score ).toFixed( 4 )}</Body4>
                </View>
              ) )}
            </>
          )}
        </View>
      )}
      {/* eslint-enable i18next/no-literal-string */}
      {/* eslint-enable react/jsx-one-expression-per-line */}
      {/* eslint-enable max-len */}
    </View>
  );
};
export default SuggestionsFooter;
