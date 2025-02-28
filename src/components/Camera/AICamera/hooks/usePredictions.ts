import { useState } from "react";
import { useIconicTaxa } from "sharedHooks";
import { Result } from "vision-camera-plugin-inatvision";

interface StoredResult {
  taxon: {
    rank_level: number;
    id: number;
    name: string;
    iconic_taxon_name: string;
  };
  combined_score: number;
  timestamp: number;
}

const usePredictions = ( ) => {
  const [result, setResult] = useState<StoredResult | null>( null );
  const [resultTimestamp, setResultTimestamp] = useState<number | undefined>( undefined );
  const [modelLoaded, setModelLoaded] = useState( false );
  const [confidenceThreshold, setConfidenceThreshold] = useState( 70 );
  const [fps, setFPS] = useState( 1 );
  const [numStoredResults, setNumStoredResults] = useState( 5 );
  const [cropRatio, setCropRatio] = useState( 1 );
  const iconicTaxa = useIconicTaxa( );

  const handleTaxaDetected = ( cvResult: Result ) => {
    if ( cvResult && !modelLoaded ) {
      setModelLoaded( true );
    }
    setResultTimestamp( cvResult.timestamp );
    let prediction = null;
    const { predictions } = cvResult;
    // As of react-native-worklets-core v1.3.0 there is a discrepancy in the way
    // objects are returned from worklets. The "object" returned is not possible
    // to be used with ...spread syntax or Object.assign which we might be using in other
    // places that reference these prediction objects here so better to create a real JS object here
    const branch = predictions
      .map( p => ( {
        name: p.name,
        rank_level: p.rank_level,
        combined_score: p.combined_score,
        taxon_id: p.taxon_id,
        ancestor_ids: p.ancestor_ids,
        rank: p.rank,
        iconic_class_id: p.iconic_class_id,
        spatial_class_id: p.spatial_class_id
      } ) )
      .sort( ( a, b ) => a.rank_level - b.rank_level );
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
        combined_score: finestPrediction.combined_score,
        timestamp: cvResult.timestamp
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
    resultTimestamp,
    setResult,
    setConfidenceThreshold,
    setFPS,
    setNumStoredResults,
    setCropRatio
  };
};

export default usePredictions;
