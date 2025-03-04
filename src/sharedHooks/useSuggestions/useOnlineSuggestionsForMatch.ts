import { useNetInfo } from "@react-native-community/netinfo";
import { useQueryClient } from "@tanstack/react-query";
import scoreImage from "api/computerVision.ts";
import flattenUploadParams from "components/Suggestions/helpers/flattenUploadParams.ts";
import { RealmContext } from "providers/contexts.ts";
import { useCallback, useEffect, useMemo } from "react";
import { log } from "sharedHelpers/logger";
import {
  findPhotoUriFromCurrentObservation,
  saveTaxaFromOnlineSuggestionsToRealm
} from "sharedHelpers/sortSuggestionsForMatch.ts";
import {
  useAuthenticatedQuery,
  useLocationPermission
} from "sharedHooks";
import {
  FETCH_STATUS_ONLINE_DISCONNECTED,
  FETCH_STATUS_ONLINE_ERROR,
  FETCH_STATUS_ONLINE_FETCHED,
  FETCH_STATUS_ONLINE_TIMED_OUT
} from "stores/createSuggestionsSlice.ts";
import useStore from "stores/useStore";

const logger = log.extend( "useOnlineSuggestionsForMatch" );

type OnlineSuggestionsResponse = {
  dataUpdatedAt: Date,
  onlineSuggestions: Object,
  error: Object,
  fetchStatus: string
}

const SCORE_IMAGE_TIMEOUT = 5000;

const { useRealm } = RealmContext;

const setQueryKey = ( uri, shouldUseEvidenceLocation, latitude ) => [
  "scoreImage",
  uri,
  { shouldUseEvidenceLocation },
  { latitude }
];

const createImageParams = async currentObservation => {
  const photoUri = findPhotoUriFromCurrentObservation( currentObservation );

  const scoreImageParams = await flattenUploadParams( photoUri );
  if ( currentObservation?.latitude ) {
    scoreImageParams.lat = currentObservation?.latitude;
    scoreImageParams.lng = currentObservation?.longitude;
  }
  return scoreImageParams;
};

const useOnlineSuggestionsForMatch = ( ): OnlineSuggestionsResponse => {
  const { isConnected } = useNetInfo( );
  const currentObservation = useStore( state => state.currentObservation );
  const setOnlineSuggestions = useStore( state => state.setOnlineSuggestions );
  const storedOnlineSuggestions = useStore( state => state.onlineSuggestions );
  const realm = useRealm( );
  const { hasPermissions: shouldUseLocation } = useLocationPermission( );

  const emptyStore = storedOnlineSuggestions.length === 0;

  // being extra careful to make sure the lat/lng is getting set in createImageParams
  // if a user goes from no location permissions to having location permissions
  const latestObservation = useStore.getState( ).currentObservation;

  const photoUri = findPhotoUriFromCurrentObservation( currentObservation );

  const queryClient = useQueryClient( );

  const truncatedLatForQueryKey = currentObservation?.latitude?.toFixed( 2 ) || null;

  const queryKey = setQueryKey( photoUri, shouldUseLocation, truncatedLatForQueryKey );

  const queryFn = useCallback( async optsWithAuth => {
    const params = await createImageParams( latestObservation );
    logger.debug( params, "params for online suggestions: does this have location?" );

    return scoreImage( params, optsWithAuth );
  }, [latestObservation] );

  // TODO if this is a remote observation with an `id` param, use
  // scoreObservation instead so we don't have to spend time resizing and
  // uploading images
  const {
    data: onlineSuggestions,
    error
  } = useAuthenticatedQuery(
    queryKey,
    queryFn,
    {
      enabled: !!( photoUri ),
      allowAnonymousJWT: true
    }
  );

  const shouldUpdateOnlineSuggestions = useMemo( ( ) => onlineSuggestions?.results !== undefined
    && emptyStore, [onlineSuggestions, emptyStore] );

  const needsTimeoutAndShouldFetch = useMemo( ( ) => onlineSuggestions === undefined
    && emptyStore, [onlineSuggestions, emptyStore] );

  const isDisconnectedAndShouldFetch = useMemo( ( ) => isConnected === false
    && emptyStore, [isConnected, emptyStore] );

  const hasErrorAndShouldFetch = useMemo( ( ) => error && emptyStore, [error, emptyStore] );

  useEffect( ( ) => {
    if ( shouldUpdateOnlineSuggestions ) {
      setOnlineSuggestions( onlineSuggestions.results, {
        fetchStatus: FETCH_STATUS_ONLINE_FETCHED,
        commonAncestor: onlineSuggestions?.common_ancestor
      } );
      saveTaxaFromOnlineSuggestionsToRealm( onlineSuggestions, realm );
    } else if ( hasErrorAndShouldFetch ) {
      setOnlineSuggestions( [], {
        fetchStatus: FETCH_STATUS_ONLINE_ERROR
      } );
    }
  }, [
    hasErrorAndShouldFetch,
    setOnlineSuggestions,
    shouldUpdateOnlineSuggestions,
    onlineSuggestions,
    realm
  ] );

  useEffect( ( ) => {
    const timer = setTimeout( ( ) => {
      if ( needsTimeoutAndShouldFetch ) {
        queryClient.cancelQueries( { queryKey } );
        setOnlineSuggestions( [], {
          fetchStatus: FETCH_STATUS_ONLINE_TIMED_OUT
        } );
      }
    }, SCORE_IMAGE_TIMEOUT );

    return ( ) => {
      clearTimeout( timer );
    };
  }, [needsTimeoutAndShouldFetch, queryClient, setOnlineSuggestions, queryKey] );

  useEffect( () => {
    if ( isDisconnectedAndShouldFetch ) {
      setOnlineSuggestions( [], {
        fetchStatus: FETCH_STATUS_ONLINE_DISCONNECTED
      } );
    }
  }, [isDisconnectedAndShouldFetch, setOnlineSuggestions] );

  return null;
};

export default useOnlineSuggestionsForMatch;
