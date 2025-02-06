const calculateConfidence = suggestion => {
  if ( !suggestion ) {
    return null;
  }
  // Note: combined_score have values between 0 and 100,
  // compared with vision-plugin v4.2.2 model results that have scores between 0 and 1
  const score = suggestion?.score
    ? ( suggestion.score * 100 )
    : suggestion.combined_score;
  const confidence = parseFloat( score.toFixed( 1 ) );
  return confidence;
};

export default calculateConfidence;
