import calculateConfidence from "components/Match/calculateConfidence.ts";
import {
  TaxonResult
} from "components/SharedComponents";
import React from "react";

interface Props {
  accessibilityLabel: string;
  onTaxonChosen: ( ) => void;
  suggestion: {
    taxon: {
      id: number;
      name: string;
      preferred_common_name: string;
      rank: string;
      iconic_taxon_name: string;
    };
    combined_score: number;
  };
  isTopSuggestion?: boolean;
}

const Suggestion = ( {
  accessibilityLabel,
  suggestion,
  onTaxonChosen,
  isTopSuggestion = false
}: Props ) => (
  <TaxonResult
    accessibilityLabel={accessibilityLabel}
    activeColor="bg-inatGreen"
    confidencePercentage={calculateConfidence( suggestion )}
    confidencePosition="text"
    fetchRemote={false}
    first
    checkmarkFocused={isTopSuggestion}
    showCheckmark
    handleCheckmarkPress={onTaxonChosen}
    hideNavButtons
    lastScreen="Suggestions"
    taxon={suggestion?.taxon}
    testID={`SuggestionsList.taxa.${suggestion?.taxon?.id}`}
    vision
  />
);

export default Suggestion;
