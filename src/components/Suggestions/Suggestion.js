// @flow

import {
  TaxonResult
} from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import {
  convertOfflineScoreToConfidence,
  convertOnlineScoreToConfidence
} from "sharedHelpers/convertScores";

type Props = {
  accessibilityLabel: string,
  fetchRemote: boolean,
  onTaxonChosen: Function,
  suggestion: Object,
  isTopSuggestion?: boolean
};

const Suggestion = ( {
  accessibilityLabel,
  fetchRemote,
  suggestion,
  onTaxonChosen,
  isTopSuggestion = false
}: Props ): Node => (
  <TaxonResult
    accessibilityLabel={accessibilityLabel}
    activeColor="bg-inatGreen"
    confidence={suggestion?.score
      ? convertOfflineScoreToConfidence( suggestion?.score )
      : convertOnlineScoreToConfidence( suggestion?.combined_score )}
    confidencePosition="text"
    fetchRemote={fetchRemote}
    first
    isTopSuggestion={isTopSuggestion}
    handleCheckmarkPress={onTaxonChosen}
    hideNavButtons
    lastScreen="Suggestions"
    taxon={suggestion?.taxon}
    testID={`SuggestionsList.taxa.${suggestion?.taxon?.id}`}
    vision
  />
);

export default Suggestion;
