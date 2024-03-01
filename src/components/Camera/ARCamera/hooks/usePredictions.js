// @flow

import {
  useState
} from "react";

const usePredictions = ( ): Object => {
  const [result, setResult] = useState( null );
  const [modelLoaded, setModelLoaded] = useState( false );
  const [confidenceThreshold, setConfidenceThreshold] = useState( 0.5 );
  const [fps, setFPS] = useState( 1 );
  const [numStoredResults, setNumStoredResults] = useState( 4 );

  const handleTaxaDetected = cvResult => {
    console.log( "[DEBUG usePredictions.js] cvResult: ", cvResult );
    if ( cvResult && !modelLoaded ) {
      setModelLoaded( true );
    }
    let prediction = null;
    const { predictions } = cvResult;
    predictions.sort( ( a, b ) => a.rank_level - b.rank_level );
    if ( predictions.length > 0 ) {
      const finestPrediction = predictions[0];
      prediction = {
        taxon: {
          rank_level: finestPrediction.rank_level,
          id: finestPrediction.taxon_id,
          name: finestPrediction.name
        },
        score: finestPrediction.score
      };
    }
    setResult( prediction );
  };

  return {
    confidenceThreshold,
    fps,
    handleTaxaDetected,
    modelLoaded,
    numStoredResults,
    result,
    setConfidenceThreshold,
    setFPS,
    setNumStoredResults
  };
};

export default usePredictions;
