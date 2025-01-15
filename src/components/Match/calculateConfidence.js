const calculateConfidence = suggestion => {
  if ( !suggestion ) { return null; }
  return suggestion?.score
    ? Math.round( suggestion.score )
    : Math.round( suggestion.combined_score );
};

export default calculateConfidence;
