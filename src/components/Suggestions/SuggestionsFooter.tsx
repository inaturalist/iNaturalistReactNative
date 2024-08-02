/* eslint-disable i18next/no-literal-string */
/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable max-len */
import {
  Body1,
  Body3,
  Body4,
  Button,
  Heading4
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Suggestions } from "components/Suggestions/SuggestionsContainer";
import type { Node } from "react";
import React from "react";
import { formatISONoTimezone } from "sharedHelpers/dateAndTime";
import { useDebugMode, useTranslation } from "sharedHooks";

import Attribution from "./Attribution";

type Props = {
  debugData: {
    selectedPhotoUri: string,
    onlineSuggestionsUpdatedAt: Date,
    timedOut: boolean,
    shouldUseEvidenceLocation: boolean,
    topSuggestionType: string,
    onlineSuggestions: [],
    offlineSuggestions: [],
    usingOfflineSuggestions: boolean,
    onlineSuggestionsError: Error
  },
  handleSkip: Function,
  hideLocationToggleButton: Function,
  hideSkip?: boolean,
  observers: Array<string>,
  shouldUseEvidenceLocation: boolean,
  suggestions: Suggestions,
  toggleLocation: Function
};

const SuggestionsFooter = ( {
  debugData,
  handleSkip,
  hideLocationToggleButton,
  hideSkip,
  observers,
  shouldUseEvidenceLocation,
  suggestions,
  toggleLocation
}: Props ): Node => {
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
      { isDebug && (
        <View className="bg-deeppink text-white p-3">
          <Heading4 className="text-white">Diagnostics</Heading4>
          <Body3 className="text-white">Online suggestions URI: {JSON.stringify( debugData?.selectedPhotoUri )}</Body3>
          <Body3 className="text-white">Online suggestions updated at: {formatISONoTimezone( debugData?.onlineSuggestionsUpdatedAt )}</Body3>
          <Body3 className="text-white">Online suggestions timed out: {JSON.stringify( debugData?.timedOut )}</Body3>
          <Body3 className="text-white">Online suggestions using location: {JSON.stringify( debugData?.shouldUseEvidenceLocation )}</Body3>
          <Body3 className="text-white">Top suggestion type: {JSON.stringify( debugData?.topSuggestionType )}</Body3>
          <Body3 className="text-white">Num online suggestions: {JSON.stringify( debugData?.onlineSuggestions?.results.length )}</Body3>
          <Body3 className="text-white">Num offline suggestions: {JSON.stringify( debugData?.offlineSuggestions?.length )}</Body3>
          <Body3 className="text-white">Using offline suggestions: {JSON.stringify( debugData?.usingOfflineSuggestions )}</Body3>
          <Body3 className="text-white">Error loading online: {JSON.stringify( debugData?.onlineSuggestionsError )}</Body3>
          <Body3 className="text-white">Scores:</Body3>
          <Body4>
            {suggestions?.topSuggestion?.taxon.name}: {suggestions?.topSuggestion?.score}
          </Body4>
          { suggestions?.otherSuggestions?.map( suggestion => (
            <Body4 key={`sugg-debug-${suggestion.taxon.id}`}>
              {suggestion.taxon.name}: {suggestion.score}
            </Body4>
          ) ) }
          <Body3 className="text-white">Combined Scores:</Body3>
          <Body4>
            {suggestions?.topSuggestion?.taxon.name}: {suggestions?.topSuggestion?.combined_score}
          </Body4>
          { suggestions?.otherSuggestions?.map( suggestion => (
            <Body4 key={`sugg-debug-${suggestion.taxon.id}`}>
              {suggestion.taxon.name}: {suggestion.combined_score}
            </Body4>
          ) ) }
        </View>
      )}
    </View>
  );
};
export default SuggestionsFooter;
