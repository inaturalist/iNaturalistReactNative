import {
  FETCH_STATUS_OFFLINE_ERROR,
  FETCH_STATUS_OFFLINE_FETCHED
} from "components/Suggestions/SuggestionsContainer.tsx";
import { RealmContext } from "providers/contexts.ts";
import {
  useCallback,
  useEffect
} from "react";
import type { RealmTaxon } from "realmModels/types";
import { log } from "sharedHelpers/logger";
import { predictImage } from "sharedHelpers/mlModel.ts";
import {
  findPhotoUriFromCurrentObservation
} from "sharedHelpers/sortSuggestionsForMatch.ts";
import useStore from "stores/useStore";
import { Prediction } from "vision-camera-plugin-inatvision";

const logger = log.extend( "useOfflineSuggestionsForMatch" );

const { useRealm } = RealmContext;

interface OfflineSuggestion {
  combined_score: number;
  taxon: {
    id: number;
    name: string;
    rank_level: number;
    iconic_taxon_name: string | undefined;
  };
}

// This function handles either regular or common ancestor predictions as input objects.
const formatPrediction = (
  prediction: Prediction,
  iconicTaxa: RealmTaxon[]
): OfflineSuggestion => {
  const iconicTaxaIds = iconicTaxa.map( t => t.id );
  const iconicTaxaLookup: {
      [key: number]: string
    } = iconicTaxa.reduce( ( acc, t ) => {
      acc[t.id] = t.name;
      return acc;
    }, { } );
  // The "lowest" ancestor_id that matches an iconic taxon
  // is the iconic taxon of this prediction.
  const iconicTaxonId = prediction.ancestor_ids
    // Need to reverse so we find the most specific iconic taxon first as an ancestor_ids is
    // a list of ancestor ids from tip to root of taxonomy
    // e.g. Aves is included in Animalia
    .reverse()
    .find( id => iconicTaxaIds.includes( id ) );
  let iconicTaxonName;
  if ( iconicTaxonId !== undefined ) {
    iconicTaxonName = iconicTaxaLookup[iconicTaxonId];
  }

  return {
    combined_score: prediction.combined_score,
    taxon: {
      id: prediction.taxon_id,
      name: prediction.name,
      rank_level: prediction.rank_level,
      iconic_taxon_name: iconicTaxonName
    }
  };
};

const useOfflineSuggestionsForMatch = ( ) => {
  const currentObservation = useStore( state => state.currentObservation );
  const offlineSuggestions = useStore( state => state.offlineSuggestions );
  const setOfflineSuggestions = useStore( state => state.setOfflineSuggestions );
  const realm = useRealm( );
  // similar to what we're doing in the AICamera to get iconic taxon name,
  // but we're offline so we only need the local list from realm
  // and don't need to fetch taxon from the API
  const iconicTaxa = realm?.objects( "Taxon" ).filtered( "isIconic = true" );

  const photoUri = findPhotoUriFromCurrentObservation( currentObservation );

  // 20240815 amanda - it's conceivable that we would want to use a cached image here eventually,
  // since the user can see the small square version of this image in MyObs/ObsDetails already
  // but for now, passing in an https photo to predictImage while offline crashes the app
  const urlWillCrashOffline = photoUri?.includes( "https://" );
  const shouldFetchOffline = currentObservation !== null
    && !urlWillCrashOffline
    && offlineSuggestions.length === 0;

  const handleError = useCallback( error => {
    setOfflineSuggestions( [], {
      fetchStatus: FETCH_STATUS_OFFLINE_ERROR
    } );
    logger.error( "Error predicting image offline", error );
    throw error;
  }, [setOfflineSuggestions] );

  const predictOffline = useCallback( async ( ) => {
    const latitude = currentObservation?.latitude;
    const longitude = currentObservation?.longitude;
    const location = { latitude, longitude };

    let rawPredictions = [];
    let commonAncestor;
    try {
      const result = await predictImage( photoUri, location );
      rawPredictions = result.predictions;
      // Destructuring here leads to different errors from the linter.
      // eslint-disable-next-line prefer-destructuring
      commonAncestor = result.commonAncestor;
    } catch ( predictImageError ) {
      handleError( predictImageError );
    }

    const formattedPredictions = rawPredictions
      .map( prediction => formatPrediction( prediction, iconicTaxa ) );
    setOfflineSuggestions( formattedPredictions, {
      fetchStatus: FETCH_STATUS_OFFLINE_FETCHED,
      commonAncestor
    } );
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
