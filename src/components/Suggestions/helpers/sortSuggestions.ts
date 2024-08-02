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
  if ( !usingOfflineSuggestions ) {
    return _.orderBy( suggestions, "combined_score", "desc" );
  }
  return suggestions;
}
