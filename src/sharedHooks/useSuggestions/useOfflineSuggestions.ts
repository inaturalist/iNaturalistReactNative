import { RealmContext } from "providers/contexts.ts";
import {
  useCallback,
  useEffect,
  useState
} from "react";
import { log } from "sharedHelpers/logger";
import { predictImage } from "sharedHelpers/mlModel.ts";
import { Prediction } from "vision-camera-plugin-inatvision";

const logger = log.extend( "useOfflineSuggestions" );

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

const useOfflineSuggestions = (
  photoUri: string,
  options: {
    onFetchError: ( { isOnline: boolean } ) => void,
    onFetchError: ( { isOnline: boolean } ) => void,
    latitude: number,
    longitude: number,
    tryOfflineSuggestions: boolean
  }
): {
  offlineSuggestions: {
    results: OfflineSuggestion[],
    commonAncestor: OfflineSuggestion | undefined
  };
} => {
  const realm = useRealm( );
  const [offlineSuggestions, setOfflineSuggestions] = useState<{
    results: OfflineSuggestion[],
    commonAncestor: OfflineSuggestion | undefined
  }>( { results: [], commonAncestor: undefined } );
  const [error, setError] = useState( null );

  const {
    onFetchError, onFetched, latitude, longitude, tryOfflineSuggestions
  } = options;

  const predictOffline = useCallback( async ( ) => {
    let rawPredictions = [];
    let commonAncestor;
    try {
      const location = { latitude, longitude };
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
    const iconicTaxa = realm?.objects( "Taxon" ).filtered( "isIconic = true" );
    const branchIDs = [...rawPredictions.map( t => t.taxon_id ), ...( commonAncestor
      ? [commonAncestor.taxon_id]
      : [] )];
    const iconicTaxonName = iconicTaxa?.find( t => branchIDs.indexOf( t.id ) >= 0 )?.name;

    // This function handles either regular or common ancestor predictions as input objects.
    const formatPrediction = ( prediction: Prediction ): OfflineSuggestion => ( {
      combined_score: prediction.combined_score,
      taxon: {
        id: Number( prediction.taxon_id ),
        name: prediction.name,
        rank_level: prediction.rank_level,
        iconic_taxon_name: iconicTaxonName
      }
    } );

    const formattedPredictions = rawPredictions?.reverse( )
      .map( prediction => formatPrediction( prediction ) );

    const commonAncestorSuggestion = commonAncestor
      ? formatPrediction( commonAncestor )
      : undefined;

    const returnValue = {
      results: formattedPredictions,
      commonAncestor: commonAncestorSuggestion
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
    onFetchError] );

  if ( error ) throw error;

  return {
    offlineSuggestions,
    refetchOfflineSuggestions
  };
};

export default useOfflineSuggestions;
