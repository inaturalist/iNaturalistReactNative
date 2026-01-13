import _ from "lodash";

import isolateHumans, { humanFilter } from "./isolateHumans";
import type { UseSuggestionsSuggestion } from "./types";
import { TopSuggestionType } from "./types";

const initialSuggestions = {
  otherSuggestions: [],
  topSuggestionType: TopSuggestionType.TOP_SUGGESTION_NONE,
  topSuggestion: undefined,
};

// TODO: MOB-1081 remove internals / consumer coupling & delete this export
// consumers are doing "math" with this to figure out what state we're in,
// `useSuggestions` should return state/status context if they need it
// namespaced to call out dependence on internal logic
export const internalUseSuggestionsInitialSuggestions = initialSuggestions;

const TOP_RESULT_SCORE_THRESHOLD = 78;

// this function does a few things:
// 1. it makes sure that if there is a human suggestion, human is the only result returned
// 2. it splits the top suggestion result out from the rest of the suggestions, which is helpful for
// displaying in SuggestionsContainer
// 4. it checks for a common ancestor as a fallback top suggestion
// 5. it returns topSuggestionType which is useful for debugging, since we're doing a lot of
// filtering of both online and offline suggestions
const filterSuggestions = (
  suggestionsToFilter: UseSuggestionsSuggestion[],
  commonAncestor?: UseSuggestionsSuggestion,
) => {
  const sortedSuggestions = _.orderBy(
    // TODO: handling humans is implemented in the vision-plugin, can it be removed here?
    isolateHumans( suggestionsToFilter ),
    "combined_score",
    "desc",
  );

  const newSuggestions = {
    ...initialSuggestions,
    otherSuggestions: sortedSuggestions,
  };
  // no suggestions
  if ( sortedSuggestions.length === 0 ) {
    return {
      ...newSuggestions,
      otherSuggestions: [],
      topSuggestionType: TopSuggestionType.TOP_SUGGESTION_NONE,
    };
  }
  // human top suggestion
  if ( sortedSuggestions.find( humanFilter ) ) {
    return {
      ...newSuggestions,
      topSuggestion: sortedSuggestions[0],
      topSuggestionType: TopSuggestionType.TOP_SUGGESTION_HUMAN,
      otherSuggestions: [],
    };
  }

  const suggestionAboveThreshold = _.find(
    sortedSuggestions,
    s => s.combined_score > TOP_RESULT_SCORE_THRESHOLD,
  );

  if ( suggestionAboveThreshold ) {
    // make sure we're not returning the top suggestion in Other Suggestions
    const firstSuggestion = _.remove(
      sortedSuggestions,
      s => s.taxon.id === suggestionAboveThreshold.taxon.id,
    ).at( 0 );
    return {
      ...newSuggestions,
      topSuggestion: firstSuggestion,
      topSuggestionType: TopSuggestionType.TOP_SUGGESTION_ABOVE_THRESHOLD,
    };
  }

  // online or offline common ancestor
  if ( commonAncestor ) {
    return {
      ...newSuggestions,
      topSuggestion: commonAncestor,
      topSuggestionType: TopSuggestionType.TOP_SUGGESTION_COMMON_ANCESTOR,
    };
  }

  // no top suggestion
  return {
    ...newSuggestions,
    topSuggestionType: TopSuggestionType.TOP_SUGGESTION_NOT_CONFIDENT,
  };
};

export default filterSuggestions;
