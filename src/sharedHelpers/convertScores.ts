const convertOfflineScoreToConfidence = ( score: number ): number => {
  if ( !score ) {
    return 0;
  }
  if ( score < 0.2 ) {
    return 1;
  }
  if ( score < 0.4 ) {
    return 2;
  }
  if ( score < 0.6 ) {
    return 3;
  }
  if ( score < 0.8 ) {
    return 4;
  }
  return 5;
};

const convertOnlineScoreToConfidence = ( score: number ): number => {
  if ( !score ) {
    return 0;
  }
  if ( score < 20 ) {
    return 1;
  }
  if ( score < 40 ) {
    return 2;
  }
  if ( score < 60 ) {
    return 3;
  }
  if ( score < 80 ) {
    return 4;
  }
  return 5;
};

export {
  convertOfflineScoreToConfidence,
  convertOnlineScoreToConfidence
};
