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
  onTaxonChosen: Function,
  suggestion: Object,
};

const Suggestion = ( { suggestion, onTaxonChosen }: Props ): Node => (
  <TaxonResult
    taxon={suggestion.taxon}
    handleCheckmarkPress={onTaxonChosen}
    testID={`Suggestion.taxa.${suggestion?.taxon?.id}`}
    confidence={suggestion?.score
      ? convertOfflineScoreToConfidence( suggestion?.score )
      : convertOnlineScoreToConfidence( suggestion.combined_score )}
    activeColor="bg-inatGreen"
    confidencePosition="text"
    first
  />
);

export default Suggestion;
