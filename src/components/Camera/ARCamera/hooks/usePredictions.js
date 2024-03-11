// @flow

import {
  useState
} from "react";
import { useIconicTaxa } from "sharedHooks";

const usePredictions = ( ): Object => {
  const [result, setResult] = useState( null );
  const [modelLoaded, setModelLoaded] = useState( false );
  const [confidenceThreshold, setConfidenceThreshold] = useState( 0.5 );
  const [fps, setFPS] = useState( 1 );
  const [numStoredResults, setNumStoredResults] = useState( 4 );
  const [cropRatio, setCropRatio] = useState( 1 );
  const iconicTaxa = useIconicTaxa( );

  const handleTaxaDetected = cvResult => {
    if ( cvResult && !modelLoaded ) {
      setModelLoaded( true );
    }
    let prediction = null;
    const { predictions: branch } = cvResult;
    branch.sort( ( a, b ) => a.rank_level - b.rank_level );
    const branchIDs = branch.map( t => t.taxon_id );
    if ( branch.length > 0 ) {
      const finestPrediction = branch[0];
      // Try to find a known iconic taxon in the model results so we can show
      // an icon if we can't show a photo
      const iconicTaxon = iconicTaxa?.find( t => branchIDs.indexOf( t.id ) >= 0 );
      prediction = {
        taxon: {
          rank_level: finestPrediction.rank_level,
          id: finestPrediction.taxon_id,
          name: finestPrediction.name,
          iconic_taxon_name: iconicTaxon?.name
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
    cropRatio,
    result,
    setConfidenceThreshold,
    setFPS,
    setNumStoredResults,
    setCropRatio
  };
};

export default usePredictions;
