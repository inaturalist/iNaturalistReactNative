import _ from "lodash";

const HUMAN_ID = 43584;

// eslint-disable-next-line no-undef
export default sortSuggestions = ( unfilteredSuggestions, options ) => {
  const { usingOfflineSuggestions, showSuggestionsWithLocation } = options;
  const humanSuggestion = _.find( unfilteredSuggestions, s => s.taxon.id === HUMAN_ID );

  if ( humanSuggestion ) {
    return [humanSuggestion];
  }
  if ( !usingOfflineSuggestions ) {
    // use the vision_score to display sorted suggestions when evidence
    // does not include a location; use the combined_score to display
    // sorted suggestions when evidence includes a location
    if ( showSuggestionsWithLocation ) {
      return _.orderBy( unfilteredSuggestions, "combined_score", "desc" );
    }
    return _.orderBy( unfilteredSuggestions, "vision_score", "desc" );
  }
  return unfilteredSuggestions;
};
