const calculateConfidence = suggestion => {
  if ( !suggestion ) {
    return null;
  }

  // Note: combined_score have values between 0 and 100,
  // compared with vision-plugin v4.2.2 model results that have a score field between 0 and 1
  // However, the common_ancestor from the API also has a score field with a range of 0-100
  const factor = suggestion.score > 1
    ? 1
    : 100;
  const score = suggestion?.score
    ? suggestion.score * factor
    : suggestion.combined_score;
  const confidence = parseFloat( score.toFixed( 1 ) );
  return confidence;
};

export default calculateConfidence;
