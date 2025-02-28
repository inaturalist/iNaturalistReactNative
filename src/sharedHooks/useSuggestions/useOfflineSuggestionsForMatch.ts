import { RealmContext } from "providers/contexts.ts";
import {
  useCallback,
  useEffect
} from "react";
import { log } from "sharedHelpers/logger";
import { predictImage } from "sharedHelpers/mlModel.ts";
import useStore from "stores/useStore";

const logger = log.extend( "useOfflineSuggestions" );

const { useRealm } = RealmContext;

// only return predictions from rank ORDER or lower. do we still want this
// for the Match screen?

// const RANK_LEVEL_ORDER = 40;

const formatPredictions = ( rawPredictions, iconicTaxa ) => {
  // similar to what we're doing in the AICamera to get iconic taxon name,
  // but we're offline so we only need the local list from realm
  // and don't need to fetch taxon from the API
  const branchIDs = rawPredictions.map( t => t.taxon_id );
  const iconicTaxonName = iconicTaxa?.find( t => branchIDs.indexOf( t.id ) >= 0 )?.name;
  // using the same rank level for displaying predictions in AI Camera
  // this is all temporary, since we ultimately want predictions
  // returned similarly to how we return them on web; this is returning a
  // single branch like on the AI Camera 2023-12-08
  const formattedPredictions = rawPredictions?.reverse( )
    // .filter( prediction => prediction.rank_level <= RANK_LEVEL_ORDER )
    .map( prediction => ( {
      combined_score: prediction.combined_score,
      taxon: {
        id: Number( prediction.taxon_id ),
        name: prediction.name,
        rank_level: prediction.rank_level,
        iconic_taxon_name: iconicTaxonName
      }
    } ) );
  return formattedPredictions;
};

const useOfflineSuggestionsForMatch = ( ) => {
  const currentObservation = useStore( state => state.currentObservation );
  const setOfflineSuggestions = useStore( state => state.setOfflineSuggestions );
  const setSuggestionsError = useStore( state => state.setSuggestionsError );
  const realm = useRealm( );
  const iconicTaxa = realm?.objects( "Taxon" ).filtered( "isIconic = true" );

  const handleError = useCallback( error => {
    setSuggestionsError( error );
    logger.error( "Error predicting image offline", error );
    throw error;
  }, [setSuggestionsError] );

  const predictOffline = useCallback( async ( ) => {
    const obsPhotos = currentObservation?.observationPhotos;

    const photoUri = obsPhotos?.[0]?.photo?.url
      || obsPhotos?.[0]?.photo?.localFilePath;

    const latitude = currentObservation?.latitude;
    const longitude = currentObservation?.longitude;
    const location = { latitude, longitude };

    let rawPredictions = [];
    try {
      const result = await predictImage( photoUri, location );
      rawPredictions = result.predictions;
    } catch ( predictImageError ) {
      handleError( predictImageError );
    }
    const formattedPredictions = formatPredictions( rawPredictions, iconicTaxa );
    setOfflineSuggestions( formattedPredictions );
  }, [
    currentObservation,
    setOfflineSuggestions,
    handleError,
    iconicTaxa
  ] );

  useEffect( ( ) => {
    if ( currentObservation !== null ) {
      predictOffline( );
    }
  }, [currentObservation, predictOffline] );

  return null;
};

export default useOfflineSuggestionsForMatch;
