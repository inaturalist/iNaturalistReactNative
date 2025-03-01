const calculateConfidence = suggestion => {
  if ( !suggestion ) {
    return null;
  }

  // Note: combined_score as returned from vision-plugin >v5 as well as iNatVisionAPI
  // have values between 0 and 100.
  // For common_ancestor from API, the score is in score field rather than combined_score
  if ( suggestion.combined_score === undefined && suggestion.score !== undefined ) {
    return parseFloat( suggestion.score.toFixed( 1 ) );
  } if ( suggestion.combined_score !== undefined ) {
    return parseFloat( suggestion.combined_score.toFixed( 1 ) );
  }

  // Return default confidence if neither score exists
  return 0;
};

export default calculateConfidence;
