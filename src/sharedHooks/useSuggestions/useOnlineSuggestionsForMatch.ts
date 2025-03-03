import scoreImage from "api/computerVision.ts";
import flattenUploadParams from "components/Suggestions/helpers/flattenUploadParams.ts";
import { FETCH_STATUS_ONLINE_ERROR } from "components/Suggestions/SuggestionsContainer.tsx";
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

const SCORE_IMAGE_TIMEOUT = 5000;

const { useRealm } = RealmContext;

const setQueryKey = ( uri, shouldUseEvidenceLocation ) => [
  "scoreImage",
  uri,
  { shouldUseEvidenceLocation }
];

const createImageParams = async ( currentObservation, shouldUseLocation ) => {
  const photoUri = findPhotoUriFromCurrentObservation( currentObservation );

  const scoreImageParams = await flattenUploadParams( photoUri );
  if ( shouldUseLocation && currentObservation?.latitude ) {
    scoreImageParams.lat = currentObservation?.latitude;
    scoreImageParams.lng = currentObservation?.longitude;
  }
  return scoreImageParams;
};

const useOnlineSuggestions = ( ): OnlineSuggestionsResponse => {
  const currentObservation = useStore( state => state.currentObservation );
  const setOnlineSuggestions = useStore( state => state.setOnlineSuggestions );
  const setSuggestionsError = useStore( state => state.setSuggestionsError );
  const setCommonAncestor = useStore( state => state.setCommonAncestor );
  const realm = useRealm( );
  const { hasPermissions: shouldUseLocation } = useLocationPermission( );

  const photoUri = findPhotoUriFromCurrentObservation( currentObservation );

  async function queryFn( optsWithAuth ) {
    const params = await createImageParams( currentObservation, shouldUseLocation );
    logger.debug( params, "params for online suggestions: does this have location?" );
    return scoreImage( params, optsWithAuth );
  }

  const queryKey = setQueryKey( photoUri, shouldUseLocation );

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
      allowAnonymousJWT: true,
      // using this instead of a useEffect to time out suggestions on a
      // slow connection but haven't tested this in the wild yet
      staleTime: SCORE_IMAGE_TIMEOUT
    }
  );

  const updateOnlineSuggestions = useCallback( ( ) => {
    setOnlineSuggestions( onlineSuggestions.results );
    setCommonAncestor( onlineSuggestions?.common_ancestor );
    saveTaxaFromOnlineSuggestionsToRealm( onlineSuggestions, realm );
  }, [onlineSuggestions, realm, setCommonAncestor, setOnlineSuggestions] );

  const shouldUpdateOnlineSuggestions = onlineSuggestions !== undefined;

  useEffect( ( ) => {
    if ( shouldUpdateOnlineSuggestions ) {
      updateOnlineSuggestions( );
    } else if ( error ) {
      setSuggestionsError( FETCH_STATUS_ONLINE_ERROR );
    }
  }, [
    error,
    setOnlineSuggestions,
    setSuggestionsError,
    shouldUpdateOnlineSuggestions,
    updateOnlineSuggestions
  ] );

  return null;
};

export default useOnlineSuggestions;
