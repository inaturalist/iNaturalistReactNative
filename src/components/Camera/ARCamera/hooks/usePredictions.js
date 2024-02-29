// @flow

import {
  useState
} from "react";

const usePredictions = ( ): Object => {
  const [result, setResult] = useState( null );
  const [modelLoaded, setModelLoaded] = useState( false );

  const handleTaxaDetected = cvResult => {
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
    handleTaxaDetected,
    modelLoaded,
    result
  };
};

export default usePredictions;
