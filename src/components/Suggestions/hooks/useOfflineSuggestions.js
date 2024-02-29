// @flow

import {
  useEffect,
  useState
} from "react";
import { Platform } from "react-native";
import { predictImage } from "sharedHelpers/cvModel.ts";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "useOfflineSuggestions" );

const useOfflineSuggestions = (
  selectedPhotoUri: string,
  options: Object
): {
  offlineSuggestions: Array<Object>,
  loadingOfflineSuggestions: boolean
} => {
  const [offlineSuggestions, setOfflineSuggestions] = useState( [] );
  const [loadingOfflineSuggestions, setLoadingOfflineSuggestions] = useState( false );
  const [error, setError] = useState( null );

  const { tryOfflineSuggestions } = options;

  useEffect( ( ) => {
    const predictOffline = async ( ) => {
      setLoadingOfflineSuggestions( true );
      let predictions = [];
      try {
        const result = await predictImage( selectedPhotoUri );
        // Android returns an object with a predictions key, while iOS returns an array because
        // currently Seek codebase as well expects different return types for each platform
        predictions = Platform.OS === "android"
          ? result.predictions
          : result;
      } catch ( predictImageError ) {
        logger.error( "Error predicting image offline", predictImageError );
        throw predictImageError;
      }
      // using the same rank level for displaying predictions in AR Camera
      // this is all temporary, since we ultimately want predictions
      // returned similarly to how we return them on web; this is returning a
      // single branch like on the AR Camera 2023-12-08
      const formattedPredictions = predictions?.reverse( )
        .filter( prediction => prediction.rank <= 40 )
        .map( prediction => ( {
          score: prediction.score,
          taxon: {
            id: Number( prediction.taxon_id ),
            name: prediction.name,
            rank_level: prediction.rank
          }
        } ) );
      setOfflineSuggestions( formattedPredictions );
      setLoadingOfflineSuggestions( false );
      return formattedPredictions;
    };

    if ( selectedPhotoUri && tryOfflineSuggestions ) {
      predictOffline( ).catch( predictOfflineError => {
        // For some reason if you throw here, it doesn't actually buble up. Is
        // an effect callback run in a promise?
        setError( predictOfflineError );
      } );
    }
  }, [selectedPhotoUri, tryOfflineSuggestions, setError] );

  if ( error ) throw error;

  return {
    offlineSuggestions,
    loadingOfflineSuggestions
  };
};

export default useOfflineSuggestions;
