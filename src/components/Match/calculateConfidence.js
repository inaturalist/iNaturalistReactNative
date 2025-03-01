const calculateConfidence = suggestion => {
  if ( !suggestion ) {
    return null;
  }

  // Note: combined_score as returned from vision-plugin >v5 as well as iNatVisionAPI
  // have values between 0 and 100.
  const confidence = parseFloat( suggestion.combined_score.toFixed( 1 ) );
  return confidence;
};

export default calculateConfidence;
