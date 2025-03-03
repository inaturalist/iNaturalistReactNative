import scoreImage from "api/computerVision.ts";
import flattenUploadParams from "components/Suggestions/helpers/flattenUploadParams.ts";
import { FETCH_STATUS_ONLINE_ERROR } from "components/Suggestions/SuggestionsContainer.tsx";
import { RealmContext } from "providers/contexts.ts";
import { useCallback, useEffect } from "react";
import {
  findPhotoUriFromCurrentObservation,
  saveTaxaFromOnlineSuggestionsToRealm
} from "sharedHelpers/sortSuggestionsForMatch.ts";
import {
  useAuthenticatedQuery
} from "sharedHooks";
import useStore from "stores/useStore";

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
  const offlineSuggestions = useStore( state => state.offlineSuggestions );
  const setSuggestionsError = useStore( state => state.setSuggestionsError );
  const shouldUseLocation = useStore( state => state.shouldUseLocation );
  const setCommonAncestor = useStore( state => state.setCommonAncestor );
  const realm = useRealm( );

  const photoUri = findPhotoUriFromCurrentObservation( currentObservation );

  async function queryFn( optsWithAuth ) {
    const params = await createImageParams( currentObservation, shouldUseLocation );
    return scoreImage( params, optsWithAuth );
  }

  const queryKey = setQueryKey( photoUri, shouldUseLocation );

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
      enabled: !!( photoUri ),
      allowAnonymousJWT: true,
      staleTime: SCORE_IMAGE_TIMEOUT
    }
  );

  const updateOnlineSuggestions = useCallback( ( ) => {
    setOnlineSuggestions( onlineSuggestions.results );
    setCommonAncestor( onlineSuggestions?.common_ancestor );
    saveTaxaFromOnlineSuggestionsToRealm( onlineSuggestions, realm );
  }, [onlineSuggestions, realm, setCommonAncestor, setOnlineSuggestions] );

  const shouldUpdateOnlineSuggestions = onlineSuggestions !== undefined
    && offlineSuggestions.length > 0;

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

  const queryObject = {
    dataUpdatedAt,
    error,
    fetchStatus
  };

  return {
    ...queryObject,
    onlineSuggestions
  };
};

export default useOnlineSuggestions;
