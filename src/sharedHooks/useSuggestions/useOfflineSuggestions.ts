import { RealmContext } from "providers/contexts.ts";
import {
  useEffect,
  useState
} from "react";
import { log } from "sharedHelpers/logger";
import { predictImage } from "sharedHelpers/mlModel.ts";

const logger = log.extend( "useOfflineSuggestions" );

const { useRealm } = RealmContext;

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
  offlineSuggestions: Array<Object>
} => {
  const realm = useRealm( );
  const [offlineSuggestions, setOfflineSuggestions] = useState( [] );
  const [error, setError] = useState( null );

  const {
    onFetchError, onFetched, latitude, longitude, tryOfflineSuggestions
  } = options;

  useEffect( ( ) => {
    const predictOffline = async ( ) => {
      let rawPredictions = [];
      try {
        const location = { latitude, longitude };
        const result = await predictImage( photoUri, location );
        rawPredictions = result.predictions;
      } catch ( predictImageError ) {
        onFetchError( { isOnline: false } );
        logger.error( "Error predicting image offline", predictImageError );
        throw predictImageError;
      }
      // similar to what we're doing in the AICamera to get iconic taxon name,
      // but we're offline so we only need the local list from realm
      // and don't need to fetch taxon from the API
      const iconicTaxa = realm?.objects( "Taxon" ).filtered( "isIconic = true" );
      const branchIDs = rawPredictions.map( t => t.taxon_id );
      const iconicTaxonName = iconicTaxa?.find( t => branchIDs.indexOf( t.id ) >= 0 )?.name;

      // using the same rank level for displaying predictions in AI Camera
      // this is all temporary, since we ultimately want predictions
      // returned similarly to how we return them on web; this is returning a
      // single branch like on the AI Camera 2023-12-08
      const formattedPredictions = rawPredictions?.reverse( )
        .filter( prediction => prediction.rank_level <= 40 )
        .map( prediction => ( {
          score: prediction.score,
          taxon: {
            id: Number( prediction.taxon_id ),
            name: prediction.name,
            rank_level: prediction.rank_level,
            iconic_taxon_name: iconicTaxonName
          }
        } ) );
      setOfflineSuggestions( formattedPredictions );
      onFetched( { isOnline: false } );
      return formattedPredictions;
    };

    if ( photoUri && tryOfflineSuggestions ) {
      predictOffline( ).catch( predictOfflineError => {
        // For some reason if you throw here, it doesn't actually buble up. Is
        // an effect callback run in a promise?
        onFetchError( { isOnline: false } );
        setError( predictOfflineError );
      } );
    }
  }, [
    photoUri,
    tryOfflineSuggestions,
    setError,
    onFetched,
    onFetchError,
    realm,
    latitude,
    longitude] );

  if ( error ) throw error;

  return {
    offlineSuggestions
  };
};

export default useOfflineSuggestions;
