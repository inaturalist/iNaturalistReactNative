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
import { formatISONoTimezone } from "sharedHelpers/dateAndTime";
import { useDebugMode, useTranslation } from "sharedHooks";

interface Props {
  debugData: {
    onlineFetchStatus: string;
    offlineFetchStatus: string;
    selectedPhotoUri: string;
    onlineSuggestionsUpdatedAt: Date;
    timedOut: boolean;
    shouldUseEvidenceLocation: boolean;
    topSuggestionType: string;
    onlineSuggestions: [];
    usingOfflineSuggestions: boolean;
    onlineSuggestionsError: Error;
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
  shouldUseEvidenceLocation: boolean;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  toggleLocation: Function;
}

const SuggestionsFooter = ( {
  debugData,
  handleSkip,
  hideLocationToggleButton,
  hideSkip,
  observers,
  shouldUseEvidenceLocation,
  toggleLocation,
}: Props ) => {
  const { t } = useTranslation( );
  const { isDebug } = useDebugMode( );

  return (
    <View className="mb-6">
      {!hideLocationToggleButton && (
        <>
          <View className="px-4 py-6">
            {shouldUseEvidenceLocation
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

              )}
          </View>
          <Attribution observers={observers} />
        </>
      )}
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
          <Body3 className="text-white">Online fetch status: {JSON.stringify( debugData?.onlineFetchStatus )}</Body3>
          <Body3 className="text-white">Online fetch status: {JSON.stringify( debugData?.offlineFetchStatus )}</Body3>
          <Body3 className="text-white">Online suggestions URI: {JSON.stringify( debugData?.selectedPhotoUri )}</Body3>
          <Body3 className="text-white">Online suggestions updated at: {formatISONoTimezone( debugData?.onlineSuggestionsUpdatedAt )}</Body3>
          <Body3 className="text-white">Online suggestions timed out: {JSON.stringify( debugData?.timedOut )}</Body3>
          <Body3 className="text-white">Online suggestions using location: {JSON.stringify( debugData?.shouldUseEvidenceLocation )}</Body3>
          <Body3 className="text-white">Top suggestion type: {JSON.stringify( debugData?.topSuggestionType )}</Body3>
          <Body3 className="text-white">Num online suggestions: {JSON.stringify( debugData?.onlineSuggestions?.results.length )}</Body3>
          <Body3 className="text-white">Using offline suggestions: {JSON.stringify( debugData?.usingOfflineSuggestions )}</Body3>
          <Body3 className="text-white">Error loading online: {JSON.stringify( debugData?.onlineSuggestionsError )}</Body3>
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
