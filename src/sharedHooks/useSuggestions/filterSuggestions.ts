import find from "lodash/find";
import orderBy from "lodash/orderBy";
import remove from "lodash/remove";

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
  const sortedSuggestions = orderBy(
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

  const suggestionAboveThreshold = find(
    sortedSuggestions,
    s => s.combined_score > TOP_RESULT_SCORE_THRESHOLD,
  );

  if ( suggestionAboveThreshold ) {
    // make sure we're not returning the top suggestion in Other Suggestions
    const firstSuggestion = remove(
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
    const sortableCommonAncestor = {
      ...commonAncestor,
      // TODO MOB-1081: we can normalize the suggs earlier b/c we shouldn't worry here
      // general context: https://github.com/inaturalist/iNaturalistReactNative/blob/505980d3359876a0af383f2ffcc481921f0eb778/src/components/Match/calculateConfidence.ts#L10-L12
      // online suggs have `score` but _redact_ `combined_score` for commonAncestor https://github.com/inaturalist/iNaturalistAPI/blob/main/lib/controllers/v1/computervision_controller.js#L389
      // the offline suggs have `combined_score` but don't have `score`
      // the codebase tends assumes `combined_score` for whenever that matters
      // the following catches when we're in a "fake" onlineSugg and shims "score" in
      // `in` operator used for OnlineSuggestion type refinement
      combined_score: !commonAncestor.combined_score && "score" in commonAncestor
        ? commonAncestor.score
        : commonAncestor.combined_score,
    };
    return {
      ...newSuggestions,
      topSuggestion: sortableCommonAncestor,
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
