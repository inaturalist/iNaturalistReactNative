import _ from "lodash";

const HUMAN_ID = 43584;

// eslint-disable-next-line no-undef
export default sortSuggestions = ( unfilteredSuggestions, options ) => {
  const { usingOfflineSuggestions } = options;
  const humanSuggestion = _.find( unfilteredSuggestions, s => s.taxon.id === HUMAN_ID );

  if ( humanSuggestion ) {
    return [humanSuggestion];
  }
  if ( !usingOfflineSuggestions ) {
    return _.orderBy( unfilteredSuggestions, "combined_score", "desc" );
  }
  return unfilteredSuggestions;
};
