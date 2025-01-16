const calculateConfidence = suggestion => {
  if ( !suggestion ) { return null; }
  const score = suggestion?.score
    ? suggestion.score
    : suggestion.combined_score;
  const confidence = parseFloat( score.toFixed( 1 ) );
  return confidence;
};

export default calculateConfidence;
