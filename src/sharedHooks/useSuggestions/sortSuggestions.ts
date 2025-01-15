import type { Suggestion } from "components/Suggestions/SuggestionsContainer";
import _ from "lodash";

// eslint-disable-next-line no-undef
export default function sortSuggestions(
  suggestions: Suggestion[],
  options = {
    usingOfflineSuggestions: false
  }
) {
  const { usingOfflineSuggestions } = options;
  if ( usingOfflineSuggestions ) {
    // sort finest to coarsest rank
    return _.orderBy( suggestions, "taxon.rank_level", "asc" );
  }
  return _.orderBy( suggestions, "combined_score", "desc" );
}
