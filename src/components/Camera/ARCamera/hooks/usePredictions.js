// @flow

import {
  useState
} from "react";
import {
  Platform
} from "react-native";

const usePredictions = ( ): Object => {
  const [result, setResult] = useState( null );
  const [modelLoaded, setModelLoaded] = useState( false );

  const handleTaxaDetected = cvResults => {
    if ( cvResults && !modelLoaded ) {
      setModelLoaded( true );
    }
    /*
      Using FrameProcessorCamera results in this as cvResults atm on Android
      [
        {
          "stateofmatter": [
            {"ancestor_ids": [Array], "name": xx, "rank": xx, "score": xx, "taxon_id": xx}
          ]
        },
        {
          "order": [
            {"ancestor_ids": [Array], "name": xx, "rank": xx, "score": xx, "taxon_id": xx}
          ]
        },
        {
          "species": [
            {"ancestor_ids": [Array], "name": xx, "rank": xx, "score": xx, "taxon_id": xx}
          ]
        }
      ]
    */
    /*
      Using FrameProcessorCamera results in this as cvResults atm on iOS (= top prediction)
      [
        {"name": "Aves", "rank": 50, "score": 0.7627944946289062, "taxon_id": 3}
      ]
    */
    const standardizePrediction = finestPrediction => ( {
      taxon: {
        rank_level: finestPrediction.rank,
        id: Number( finestPrediction.taxon_id ),
        name: finestPrediction.name
      },
      score: finestPrediction.score
    } );
    let prediction = null;
    let predictions = [];
    if ( Platform.OS === "ios" ) {
      if ( cvResults.length > 0 ) {
        const finestPrediction = cvResults[cvResults.length - 1];
        prediction = standardizePrediction( finestPrediction );
      }
    } else {
      predictions = cvResults
        ?.map( r => {
          const rank = Object.keys( r )[0];
          return r[rank][0];
        } )
        .sort( ( a, b ) => a.rank - b.rank );
      if ( predictions.length > 0 ) {
        const finestPrediction = predictions[0];
        prediction = standardizePrediction( finestPrediction );
      }
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
