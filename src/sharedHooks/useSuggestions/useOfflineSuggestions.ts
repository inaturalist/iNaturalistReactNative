import { RealmContext } from "providers/contexts";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import type { RealmTaxon } from "realmModels/types";
import { log } from "sharedHelpers/logger";
import { predictImage } from "sharedHelpers/mlModel";
import type { Prediction } from "vision-camera-plugin-inatvision";

import type { UseSuggestionsOfflineSuggestion } from "./types";

const logger = log.extend( "useOfflineSuggestions" );

const { useRealm } = RealmContext;

const useOfflineSuggestions = (
  photoUri: string,
  options: {
    onFetchError: ( _p: { isOnline: boolean } ) => void;
    onFetched: ( _p: { isOnline: boolean } ) => void;
    latitude?: number;
    longitude?: number;
    tryOfflineSuggestions: boolean;
  },
): {
  offlineSuggestions: {
    results: UseSuggestionsOfflineSuggestion[];
    commonAncestor?: UseSuggestionsOfflineSuggestion;
  };
  refetchOfflineSuggestions: () => void;
} => {
  const realm = useRealm( );
  const [offlineSuggestions, setOfflineSuggestions] = useState<{
    results: UseSuggestionsOfflineSuggestion[];
    commonAncestor?: UseSuggestionsOfflineSuggestion;
  }>( { results: [], commonAncestor: undefined } );
  const [error, setError] = useState( null );

  const {
    onFetchError, onFetched, latitude, longitude, tryOfflineSuggestions,
  } = options;

  const predictOffline = useCallback( async ( ) => {
    let rawPredictions = [];
    let commonAncestor;
    try {
      const location = ( typeof latitude === "number" && typeof longitude === "number" )
        ? { latitude, longitude }
        : undefined;
      const result = await predictImage( photoUri, location );
      rawPredictions = result.predictions;
      // Destructuring here leads to different errors from the linter.
      // eslint-disable-next-line prefer-destructuring
      commonAncestor = result.commonAncestor;
    } catch ( predictImageError ) {
      onFetchError( { isOnline: false } );
      logger.error( "Error predicting image offline", predictImageError );
      throw predictImageError;
    }
    // similar to what we're doing in the AICamera to get iconic taxon name,
    // but we're offline so we only need the local list from realm
    // and don't need to fetch taxon from the API
    const iconicTaxa = realm.objects<RealmTaxon>( "Taxon" ).filtered( "isIconic = true" );
    const iconicTaxaLookup = Object.fromEntries(
      iconicTaxa.map( t => [t.id, t.name] ),
    );

    // This function handles either regular or common ancestor predictions as input objects.
    const formatPrediction = ( prediction: Prediction ): UseSuggestionsOfflineSuggestion => {
      // The "lowest" ancestor_id that matches an iconic taxon
      // is the iconic taxon of this prediction.
      const iconicTaxonId = prediction.ancestor_ids
        // Need to reverse so we find the most specific iconic taxon first as an ancestor_ids is
        // a list of ancestor ids from tip to root of taxonomy
        // e.g. Aves is included in Animalia
        .reverse()
        .find( id => id in iconicTaxaLookup );
      const id = prediction.taxon_id;

      return {
        combined_score: prediction.combined_score,
        taxon: {
          id,
          name: prediction.name,
          rank_level: prediction.rank_level,
          iconic_taxon_name: iconicTaxonId !== undefined
            ? iconicTaxaLookup[iconicTaxonId]
            : undefined,
        },
      };
    };

    const formattedPredictions = rawPredictions
      .map( prediction => formatPrediction( prediction ) );

    const commonAncestorSuggestion = commonAncestor
      ? formatPrediction( commonAncestor )
      : undefined;

    const returnValue = {
      results: formattedPredictions,
      commonAncestor: commonAncestorSuggestion,
    };

    setOfflineSuggestions( returnValue );
    onFetched( { isOnline: false } );
    return returnValue;
  }, [latitude, longitude, onFetchError, onFetched, photoUri, realm] );

  const refetchOfflineSuggestions = () => {
    predictOffline().catch( predictOfflineError => {
      // TODO: throw error in a way that doesnt potentially bubble up
      onFetchError( { isOnline: false } );
      setError( predictOfflineError );
    } );
  };

  useEffect( ( ) => {
    if ( photoUri && tryOfflineSuggestions ) {
      predictOffline( ).catch( predictOfflineError => {
        // For some reason if you throw here, it doesn't actually buble up. Is
        // an effect callback run in a promise?
        onFetchError( { isOnline: false } );
        setError( predictOfflineError );
      } );
    }
  }, [
    predictOffline,
    photoUri,
    tryOfflineSuggestions,
    setError,
    onFetchError,
  ] );

  if ( error ) throw error;

  return {
    offlineSuggestions,
    refetchOfflineSuggestions,
  };
};

export default useOfflineSuggestions;
