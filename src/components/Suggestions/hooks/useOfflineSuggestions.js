// @flow

import {
  useEffect,
  useState
} from "react";
import { predictImage } from "sharedHelpers/cvModel.ts";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "useOfflineSuggestions" );

const useOfflineSuggestions = (
  selectedPhotoUri: string,
  options: Object
): {
  offlineSuggestions: Array<Object>
} => {
  const [offlineSuggestions, setOfflineSuggestions] = useState( [] );
  const [error, setError] = useState( null );

  const { dispatch, tryOfflineSuggestions } = options;

  useEffect( ( ) => {
    const predictOffline = async ( ) => {
      let rawPredictions = [];
      try {
        const result = await predictImage( selectedPhotoUri );
        // Android returns an object with a predictions key, while iOS returns an array because
        // currently Seek codebase as well expects different return types for each platform
        rawPredictions = result.predictions;
      } catch ( predictImageError ) {
        dispatch( { type: "SET_FETCH_STATUS", fetchStatus: "offline-error" } );
        logger.error( "Error predicting image offline", predictImageError );
        throw predictImageError;
      }
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
            rank_level: prediction.rank_level
          }
        } ) );
      setOfflineSuggestions( formattedPredictions );
      dispatch( { type: "SET_FETCH_STATUS", fetchStatus: "offline-fetched" } );
      return formattedPredictions;
    };

    if ( selectedPhotoUri && tryOfflineSuggestions ) {
      dispatch( { type: "SET_FETCH_STATUS", fetchStatus: "fetching-offline" } );
      predictOffline( ).catch( predictOfflineError => {
        // For some reason if you throw here, it doesn't actually buble up. Is
        // an effect callback run in a promise?
        dispatch( { type: "SET_FETCH_STATUS", fetchStatus: "offline-error" } );
        setError( predictOfflineError );
      } );
    }
  }, [selectedPhotoUri, tryOfflineSuggestions, setError, dispatch] );

  if ( error ) throw error;

  return {
    offlineSuggestions
  };
};

export default useOfflineSuggestions;
