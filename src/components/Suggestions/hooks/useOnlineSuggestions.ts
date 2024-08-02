import {
  useNetInfo
} from "@react-native-community/netinfo";
import { useQueryClient } from "@tanstack/react-query";
import scoreImage from "api/computerVision.ts";
import { RealmContext } from "providers/contexts";
import {
  useCallback, useEffect, useState
} from "react";
import Taxon from "realmModels/Taxon";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import {
  useAuthenticatedQuery
} from "sharedHooks";

const SCORE_IMAGE_TIMEOUT = 5_000;

const { useRealm } = RealmContext;

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
  const realm = useRealm( );
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

  const saveTaxaToRealm = useCallback( ( ) => {
    // we're already getting all this taxon information anytime we make this API
    // call, so we might as well store it in realm immediately instead of waiting
    // for useTaxon to fetch individual taxon results
    const mappedTaxa = onlineSuggestions?.results?.map(
      suggestion => Taxon.mapApiToRealm( suggestion.taxon, realm )
    );
    if ( onlineSuggestions?.common_ancestor ) {
      const mappedCommonAncestor = Taxon
        .mapApiToRealm( onlineSuggestions?.common_ancestor.taxon, realm );
      mappedTaxa.push( mappedCommonAncestor );
    }
    safeRealmWrite( realm, ( ) => {
      mappedTaxa.forEach( remoteTaxon => {
        realm.create(
          "Taxon",
          { ...remoteTaxon, _synced_at: new Date( ) },
          "modified"
        );
      } );
    }, "saving remote taxon from onlineSuggestions" );
  }, [realm, onlineSuggestions] );

  useEffect( ( ) => {
    if ( onlineSuggestions !== undefined ) {
      saveTaxaToRealm( );
      dispatch( { type: "SET_FETCH_STATUS", fetchStatus: "online-fetched" } );
    } else if ( error ) {
      dispatch( { type: "SET_FETCH_STATUS", fetchStatus: "online-error" } );
    }
  }, [dispatch, onlineSuggestions, error, saveTaxaToRealm] );

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
