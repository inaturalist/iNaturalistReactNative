interface Suggestion {
  combined_score?: number;
  score?: number;
}
const calculateConfidence = ( suggestion: Suggestion ) => {
  if ( !suggestion ) {
    return null;
  }

  // Note: combined_score as returned from vision-plugin >v5 as well as iNatVisionAPI
  // have values between 0 and 100.
  // For common_ancestor from API, the combined_core parameter is renamed to score by the node API
  if ( suggestion.combined_score === undefined && suggestion.score !== undefined ) {
    return parseFloat( suggestion.score.toFixed( 1 ) );
  } if ( suggestion.combined_score !== undefined ) {
    return parseFloat( suggestion.combined_score.toFixed( 1 ) );
  }

  // Return null confidence if neither score exists - I hope to see this as NaN and detect the
  // problem rather than hiding it.
  return null;
};

export default calculateConfidence;
