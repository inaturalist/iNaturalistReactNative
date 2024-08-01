import {
  useNetInfo
} from "@react-native-community/netinfo";
import { useQueryClient } from "@tanstack/react-query";
import scoreImage from "api/computerVision.ts";
import {
  useCallback, useEffect, useState
} from "react";
import {
  useAuthenticatedQuery
} from "sharedHooks";

const SCORE_IMAGE_TIMEOUT = 5_000;

type OnlineSuggestionsResponse = {
  dataUpdatedAt: Date,
  onlineSuggestions: Object,
  loadingOnlineSuggestions: boolean,
  timedOut: boolean,
  error: Object,
  resetTimeout: Function
  isRefetching: boolean
}

const useOnlineSuggestions = (
  options: Object
): OnlineSuggestionsResponse => {
  const {
    dispatch,
    flattenedUploadParams,
    queryKey,
    shouldFetchOnlineSuggestions
  } = options;

  const queryClient = useQueryClient( );
  const [timedOut, setTimedOut] = useState( false );
  const { isConnected } = useNetInfo( );

  async function queryFn( optsWithAuth ) {
    const params = flattenedUploadParams;
    return scoreImage( params, optsWithAuth );
  }

  // TODO if this is a remote observation with an `id` param, use
  // scoreObservation instead so we don't have to spend time resizing and
  // uploading images
  const {
    data: onlineSuggestions,
    dataUpdatedAt,
    fetchStatus,
    error
  } = useAuthenticatedQuery(
    queryKey,
    queryFn,
    {
      enabled: !!shouldFetchOnlineSuggestions
        && !!( flattenedUploadParams?.image ),
      allowAnonymousJWT: true
    }
  );

  // Give up on suggestions request after a timeout
  useEffect( ( ) => {
    const timer = setTimeout( ( ) => {
      if ( onlineSuggestions === undefined ) {
        queryClient.cancelQueries( { queryKey } );
        dispatch( { type: "SET_FETCH_STATUS", fetchStatus: "online-error" } );
        setTimedOut( true );
      }
    }, SCORE_IMAGE_TIMEOUT );

    return ( ) => {
      clearTimeout( timer );
    };
  }, [onlineSuggestions, queryKey, queryClient, dispatch] );

  const resetTimeout = useCallback( ( ) => {
    setTimedOut( false );
  }, [] );

  useEffect( () => {
    if ( isConnected === false ) {
      setTimedOut( true );
    }
  }, [isConnected, dispatch] );

  useEffect( ( ) => {
    if ( onlineSuggestions !== undefined ) {
      dispatch( { type: "SET_FETCH_STATUS", fetchStatus: "online-fetched" } );
    } else if ( error ) {
      dispatch( { type: "SET_FETCH_STATUS", fetchStatus: "online-error" } );
    }
  }, [dispatch, onlineSuggestions, error] );

  const queryObject = {
    dataUpdatedAt,
    error,
    timedOut,
    resetTimeout,
    fetchStatus
  };

  return timedOut
    ? {
      ...queryObject,
      onlineSuggestions: undefined
    }
    : {
      ...queryObject,
      onlineSuggestions
    };
};

export default useOnlineSuggestions;
