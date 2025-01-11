import {
  TaxonResult
} from "components/SharedComponents";
import React from "react";
import {
  convertOfflineScoreToConfidence,
  convertOnlineScoreToConfidence
} from "sharedHelpers/convertScores.ts";

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
    score: number;
    combined_score: number;
  };
  isTopSuggestion?: boolean;
  hideCheckmark?: boolean;
}

const Suggestion = ( {
  accessibilityLabel,
  suggestion,
  onTaxonChosen,
  isTopSuggestion = false,
  hideCheckmark = false
}: Props ) => (
  <TaxonResult
    accessibilityLabel={accessibilityLabel}
    activeColor="bg-inatGreen"
    confidence={suggestion?.score
      ? convertOfflineScoreToConfidence( suggestion?.score )
      : convertOnlineScoreToConfidence( suggestion?.combined_score )}
    confidencePosition="text"
    fetchRemote={false}
    first
    checkmarkFocused={isTopSuggestion}
    showCheckmark={!hideCheckmark}
    handleCheckmarkPress={onTaxonChosen}
    hideNavButtons
    lastScreen="Suggestions"
    taxon={suggestion?.taxon}
    testID={`SuggestionsList.taxa.${suggestion?.taxon?.id}`}
    vision
  />
);

export default Suggestion;
