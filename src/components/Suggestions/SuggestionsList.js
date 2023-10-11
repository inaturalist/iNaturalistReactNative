// @flow

import { Heading4, TaxonResult } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

type Props = {
  nearbySuggestions: Array<Object>,
  onTaxonChosen: Function
};

const SuggestionsList = ( {
  nearbySuggestions,
  onTaxonChosen
}: Props ): Node => {
  const { t } = useTranslation( );

  if ( !nearbySuggestions || nearbySuggestions.length === 0 ) {
    return null;
  }

  const topSuggestion = nearbySuggestions[0];

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

  return (
    <>
      <Heading4 className="mt-6 mb-4 ml-4">{t( "TOP-ID-SUGGESTION" )}</Heading4>
      <View className="bg-inatGreen/[.13]">
        <TaxonResult
          key={topSuggestion.taxon.id}
          taxon={topSuggestion.taxon}
          handleCheckmarkPress={( ) => onTaxonChosen( topSuggestion.taxon )}
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
            handleCheckmarkPress={( ) => onTaxonChosen( suggestion.taxon )}
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
