import {
  initialSuggestions,
  TOP_SUGGESTION_ABOVE_OFFLINE_THRESHOLD,
  TOP_SUGGESTION_ABOVE_ONLINE_THRESHOLD,
  TOP_SUGGESTION_COMMON_ANCESTOR,
  TOP_SUGGESTION_HUMAN,
  TOP_SUGGESTION_NONE,
  TOP_SUGGESTION_NOT_CONFIDENT
} from "components/Suggestions/SuggestionsContainer.tsx";
import _ from "lodash";

import isolateHumans, { humanFilter } from "./isolateHumans";
import sortSuggestions from "./sortSuggestions";

const THRESHOLD = 78;

// this function does a few things:
// 1. it makes sure that if there is a human suggestion, human is the only result returned
// 2. it makes sure we're filtering out any results below the THRESHOLD
// so we only show results we're fairly confident in
// 3. it splits the top suggestion result out from the rest of the suggestions, which is helpful for
// displaying in SuggestionsContainer
// 4. it checks for a common ancestor as a fallback top suggestion if user is online
// 5. it returns topSuggestionType which is useful for debugging, since we're doing a lot of
// filtering of both online and offline suggestions
const filterSuggestions = ( suggestionsToFilter, usingOfflineSuggestions, commonAncestor ) => {
  const sortedSuggestions = sortSuggestions(
    isolateHumans( suggestionsToFilter ),
    { usingOfflineSuggestions }
  );
  const newSuggestions = {
    ...initialSuggestions,
    otherSuggestions: sortedSuggestions
  };
  // no suggestions
  if ( sortedSuggestions.length === 0 ) {
    return {
      ...newSuggestions,
      otherSuggestions: [],
      topSuggestionType: TOP_SUGGESTION_NONE
    };
  }
  // human top suggestion
  if ( sortedSuggestions.find( humanFilter ) ) {
    return {
      ...newSuggestions,
      topSuggestion: sortedSuggestions[0],
      topSuggestionType: TOP_SUGGESTION_HUMAN,
      otherSuggestions: []
    };
  }

  const suggestionAboveThreshold = _.find(
    sortedSuggestions,
    s => s.combined_score > THRESHOLD
  );

  if ( suggestionAboveThreshold ) {
    // make sure we're not returning the top suggestion in Other Suggestions
    const firstSuggestion = _.remove(
      sortedSuggestions,
      s => s.taxon.id === suggestionAboveThreshold.taxon.id
    ).at( 0 );
    return {
      ...newSuggestions,
      topSuggestion: firstSuggestion,
      topSuggestionType: usingOfflineSuggestions
        ? TOP_SUGGESTION_ABOVE_OFFLINE_THRESHOLD
        : TOP_SUGGESTION_ABOVE_ONLINE_THRESHOLD
    };
  }
  if ( !suggestionAboveThreshold && usingOfflineSuggestions ) {
    // no top suggestion for offline
    return {
      ...newSuggestions,
      topSuggestion: null,
      topSuggestionType: TOP_SUGGESTION_NOT_CONFIDENT
    };
  }

  // online common ancestor
  if ( commonAncestor ) {
    return {
      ...newSuggestions,
      topSuggestion: commonAncestor,
      topSuggestionType: TOP_SUGGESTION_COMMON_ANCESTOR
    };
  }

  // no top suggestion
  return {
    ...newSuggestions,
    topSuggestionType: TOP_SUGGESTION_NOT_CONFIDENT
  };
};

export default filterSuggestions;
