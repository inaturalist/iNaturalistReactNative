// @flow

import { Body1, Heading4, TaxonResult } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { ActivityIndicator } from "react-native-paper";
import {
  convertOfflineScoreToConfidence,
  convertOnlineScoreToConfidence
} from "sharedHelpers/convertScores";
import { useTranslation } from "sharedHooks";

type Props = {
  loadingSuggestions: boolean,
  nearbySuggestions: Array<Object>,
  onTaxonChosen: Function,
};

const SuggestionsList = ( {
  loadingSuggestions,
  nearbySuggestions,
  onTaxonChosen
}: Props ): Node => {
  const { t } = useTranslation( );

  if ( loadingSuggestions ) {
    return (
      <View className="justify-center items-center mt-5" testID="SuggestionsList.loading">
        <ActivityIndicator large />
      </View>
    );
  }

  if ( !nearbySuggestions || nearbySuggestions.length === 0 ) {
    return (
      <>
        <Heading4 className="mt-6 mb-4 ml-4">{t( "TOP-ID-SUGGESTION" )}</Heading4>
        <Body1 className="mx-10 text-center">
          {t( "iNaturalist-isnt-able-to-provide-a-top-ID-suggestion-for-this-photo" )}
        </Body1>
        <Heading4 className="mt-6 mb-4 ml-4">{t( "NEARBY-SUGGESTIONS" )}</Heading4>
        <Body1 className="mx-10 text-center">
          {t( "iNaturalist-has-no-ID-suggestions-for-this-photo" )}
        </Body1>
      </>
    );
  }

  const topSuggestion = nearbySuggestions[0];

  return (
    <>
      <Heading4 className="mt-6 mb-4 ml-4">{t( "TOP-ID-SUGGESTION" )}</Heading4>
      <View className="bg-inatGreen/[.13]">
        <TaxonResult
          key={topSuggestion.taxon.id}
          taxon={topSuggestion.taxon}
          handleCheckmarkPress={onTaxonChosen}
          testID={`SuggestionsList.taxa.${topSuggestion.taxon.id}`}
          confidence={topSuggestion?.score
            ? convertOfflineScoreToConfidence( topSuggestion?.score )
            : convertOnlineScoreToConfidence( topSuggestion.combined_score )}
          activeColor="bg-inatGreen"
          confidencePosition="text"
          first
        />
      </View>
      <Heading4 className="mt-6 mb-4 ml-4">
        {topSuggestion?.score
          ? t( "ALL-SUGGESTIONS" )
          : t( "NEARBY-SUGGESTIONS" )}
      </Heading4>
      {nearbySuggestions.map( ( suggestion, index ) => {
        if ( index === 0 ) {
          return null;
        }
        return (
          <TaxonResult
            key={suggestion.taxon.id}
            taxon={suggestion.taxon}
            handleCheckmarkPress={onTaxonChosen}
            testID={`SuggestionsList.taxa.${suggestion.taxon.id}`}
            confidence={suggestion?.score
              ? convertOfflineScoreToConfidence( suggestion?.score )
              : convertOnlineScoreToConfidence( suggestion.combined_score )}
            activeColor="bg-inatGreen"
            confidencePosition="text"
            first={index === 0}
          />
        );
      } )}
    </>
  );
};

export default SuggestionsList;
