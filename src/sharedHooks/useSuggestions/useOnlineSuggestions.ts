import {
  useNetInfo
} from "@react-native-community/netinfo";
import { useQueryClient } from "@tanstack/react-query";
import scoreImage from "api/computerVision.ts";
import i18n from "i18next";
import { RealmContext } from "providers/contexts.ts";
import {
  useCallback, useEffect, useState
} from "react";
import Taxon from "realmModels/Taxon";
import safeRealmWrite from "sharedHelpers/safeRealmWrite.ts";
import {
  useAuthenticatedQuery,
  useCurrentUser
} from "sharedHooks";

const SCORE_IMAGE_TIMEOUT = 5_000;

const { useRealm } = RealmContext;

interface OnlineSuggestionsResponse {
  dataUpdatedAt: Date;
  onlineSuggestions: object;
  loadingOnlineSuggestions: boolean;
  timedOut: boolean;
  error: object;
  resetTimeout: () => void;
  isRefetching: boolean;
}

const useOnlineSuggestions = (
  options: object
): OnlineSuggestionsResponse => {
  const realm = useRealm( );
  const {
    onFetchError,
    onFetched,
    scoreImageParams,
    queryKey,
    shouldFetchOnlineSuggestions
  } = options;

  const queryClient = useQueryClient( );
  const [timedOut, setTimedOut] = useState( false );
  const { isConnected } = useNetInfo( );
  const currentUser = useCurrentUser();
  // Use locale in case there is no user session
  const locale = i18n?.language ?? "en";

  async function queryFn( optsWithAuth ) {
    const params = {
      ...scoreImageParams,
      ...( !currentUser && { locale } )
    };
    return scoreImage( params, optsWithAuth );
  }

  // TODO if this is a remote observation with an `id` param, use
  // scoreObservation instead so we don't have to spend time resizing and
  // uploading images
  const {
    data: onlineSuggestions,
    dataUpdatedAt,
    refetch,
    fetchStatus,
    error
  } = useAuthenticatedQuery(
    queryKey,
    queryFn,
    {
      enabled: !!shouldFetchOnlineSuggestions
        && !!( scoreImageParams?.image ),
      allowAnonymousJWT: true
    }
  );

  // Give up on suggestions request after a timeout
  useEffect( ( ) => {
    const timer = setTimeout( ( ) => {
      if ( onlineSuggestions === undefined ) {
        queryClient.cancelQueries( { queryKey } );
        onFetchError( { isOnline: true } );
        setTimedOut( true );
      }
    }, SCORE_IMAGE_TIMEOUT );

    return ( ) => {
      clearTimeout( timer );
    };
  }, [onlineSuggestions, queryKey, queryClient, onFetchError] );

  const resetTimeout = useCallback( ( ) => {
    setTimedOut( false );
  }, [] );

  useEffect( () => {
    if ( isConnected === false ) {
      setTimedOut( true );
    }
  }, [isConnected] );

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
          Taxon.forUpdate( remoteTaxon ),
          "modified"
        );
      } );
    }, "saving remote taxon from onlineSuggestions" );
  }, [realm, onlineSuggestions] );

  useEffect( ( ) => {
    if ( onlineSuggestions !== undefined ) {
      saveTaxaToRealm( );
      onFetched( { isOnline: true } );
    } else if ( error ) {
      onFetchError( { isOnline: true } );
    }
  }, [onFetchError, onlineSuggestions, error, saveTaxaToRealm, onFetched] );

  const queryObject = {
    dataUpdatedAt,
    error,
    refetch,
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
