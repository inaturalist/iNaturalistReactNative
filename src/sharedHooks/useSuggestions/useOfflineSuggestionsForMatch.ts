import { FETCH_STATUS_OFFLINE_ERROR } from "components/Suggestions/SuggestionsContainer.tsx";
import { RealmContext } from "providers/contexts.ts";
import {
  useCallback,
  useEffect
} from "react";
import { log } from "sharedHelpers/logger";
import { predictImage } from "sharedHelpers/mlModel.ts";
import {
  findPhotoUriFromCurrentObservation
} from "sharedHelpers/sortSuggestionsForMatch.ts";
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

  const photoUri = findPhotoUriFromCurrentObservation( currentObservation );

  // 20240815 amanda - it's conceivable that we would want to use a cached image here eventually,
  // since the user can see the small square version of this image in MyObs/ObsDetails already
  // but for now, passing in an https photo to predictImage while offline crashes the app
  const urlWillCrashOffline = photoUri?.includes( "https://" );
  const shouldFetchOffline = currentObservation !== null && !urlWillCrashOffline;

  const handleError = useCallback( error => {
    setSuggestionsError( FETCH_STATUS_OFFLINE_ERROR );
    logger.error( "Error predicting image offline", error );
    throw error;
  }, [setSuggestionsError] );

  const predictOffline = useCallback( async ( ) => {
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
    handleError,
    iconicTaxa,
    photoUri,
    setOfflineSuggestions
  ] );

  useEffect( ( ) => {
    if ( shouldFetchOffline ) {
      predictOffline( );
    }
  }, [shouldFetchOffline, predictOffline] );

  return null;
};

export default useOfflineSuggestionsForMatch;
