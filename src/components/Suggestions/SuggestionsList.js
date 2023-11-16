// @flow

import { useNavigation } from "@react-navigation/native";
import { Body1, Heading4, TaxonResult } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import { ActivityIndicator } from "react-native-paper";
import { useTranslation } from "sharedHooks";

const convertScoreToConfidence = score => {
  if ( !score ) {
    return null;
  }
  if ( score < 20 ) {
    return 1;
  }
  if ( score < 40 ) {
    return 2;
  }
  if ( score < 60 ) {
    return 3;
  }
  if ( score < 80 ) {
    return 4;
  }
  return 5;
};

type Props = {
  nearbySuggestions: Array<Object>,
  onTaxonChosen: Function,
  loadingSuggestions: boolean,
  setLoading: Function
};

const SuggestionsList = ( {
  nearbySuggestions,
  onTaxonChosen,
  loadingSuggestions,
  setLoading
}: Props ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const onTaxonResultChosen = useCallback( async taxon => {
    setLoading( true );
    await onTaxonChosen( taxon );
    setLoading( false );
    navigation.goBack( );
  }, [navigation, onTaxonChosen, setLoading] );

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
          handleCheckmarkPress={onTaxonResultChosen}
          testID={`SuggestionsList.taxa.${topSuggestion.taxon.id}`}
          confidence={convertScoreToConfidence( topSuggestion.combined_score )}
          activeColor="bg-inatGreen"
          confidencePosition="text"
          first
        />
      </View>
      <Heading4 className="mt-6 mb-4 ml-4">{t( "NEARBY-SUGGESTIONS" )}</Heading4>
      {nearbySuggestions.map( ( suggestion, index ) => {
        if ( index === 0 ) {
          return null;
        }
        return (
          <TaxonResult
            key={suggestion.taxon.id}
            taxon={suggestion.taxon}
            handleCheckmarkPress={onTaxonResultChosen}
            testID={`SuggestionsList.taxa.${suggestion.taxon.id}`}
            confidence={convertScoreToConfidence( suggestion.combined_score )}
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
