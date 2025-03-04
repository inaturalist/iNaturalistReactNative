import { useNetInfo } from "@react-native-community/netinfo";
import { useQueryClient } from "@tanstack/react-query";
import scoreImage from "api/computerVision.ts";
import flattenUploadParams from "components/Suggestions/helpers/flattenUploadParams.ts";
import {
  FETCH_STATUS_ONLINE_ERROR,
  FETCH_STATUS_ONLINE_FETCHED
} from "components/Suggestions/SuggestionsContainer.tsx";
import { RealmContext } from "providers/contexts.ts";
import { useCallback, useEffect } from "react";
import { log } from "sharedHelpers/logger";
import {
  findPhotoUriFromCurrentObservation,
  saveTaxaFromOnlineSuggestionsToRealm
} from "sharedHelpers/sortSuggestionsForMatch.ts";
import {
  useAuthenticatedQuery,
  useLocationPermission
} from "sharedHooks";
import useStore from "stores/useStore";

const logger = log.extend( "useOnlineSuggestionsForMatch" );

type OnlineSuggestionsResponse = {
  dataUpdatedAt: Date,
  onlineSuggestions: Object,
  error: Object,
  fetchStatus: string
}

const SCORE_IMAGE_TIMEOUT = 5_000;

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

const useOnlineSuggestions = ( ): OnlineSuggestionsResponse => {
  const { isConnected } = useNetInfo( );
  const currentObservation = useStore( state => state.currentObservation );
  const setOnlineSuggestions = useStore( state => state.setOnlineSuggestions );
  const setCommonAncestor = useStore( state => state.setCommonAncestor );
  const setTimedOut = useStore( state => state.setTimedOut );
  const realm = useRealm( );
  const { hasPermissions: shouldUseLocation } = useLocationPermission( );

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

  const updateOnlineSuggestions = useCallback( ( ) => {
    setOnlineSuggestions( onlineSuggestions.results, FETCH_STATUS_ONLINE_FETCHED );
    setCommonAncestor( onlineSuggestions?.common_ancestor );
    saveTaxaFromOnlineSuggestionsToRealm( onlineSuggestions, realm );
  }, [onlineSuggestions, realm, setCommonAncestor, setOnlineSuggestions] );

  const shouldUpdateOnlineSuggestions = onlineSuggestions !== undefined;

  useEffect( ( ) => {
    if ( shouldUpdateOnlineSuggestions ) {
      updateOnlineSuggestions( );
    } else if ( error ) {
      setOnlineSuggestions( [], FETCH_STATUS_ONLINE_ERROR );
    }
  }, [
    error,
    setOnlineSuggestions,
    shouldUpdateOnlineSuggestions,
    updateOnlineSuggestions
  ] );

  useEffect( ( ) => {
    const timer = setTimeout( ( ) => {
      if ( onlineSuggestions === undefined ) {
        queryClient.cancelQueries( { queryKey } );
        setTimedOut( true );
      }
    }, SCORE_IMAGE_TIMEOUT );

    return ( ) => {
      clearTimeout( timer );
    };
  }, [onlineSuggestions, queryClient, setTimedOut, queryKey] );

  useEffect( () => {
    if ( isConnected === false ) {
      setTimedOut( true );
    }
  }, [isConnected, setTimedOut] );

  return null;
};

export default useOnlineSuggestions;
