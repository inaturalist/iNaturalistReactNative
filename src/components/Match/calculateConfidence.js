const calculateConfidence = suggestion => {
  if ( !suggestion ) {
    return null;
  }

  // Note: combined_score as returned from vision-plugin >v5 as well as iNatVisionAPI
  // have values between 0 and 100. common_ancestor from the API has a score field
  // with a range of 0-100
  const score = suggestion?.score
    ? suggestion.score
    : suggestion.combined_score;
  const confidence = parseFloat( score.toFixed( 1 ) );
  return confidence;
};

export default calculateConfidence;
