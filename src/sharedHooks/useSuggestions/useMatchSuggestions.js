import { useNetInfo } from "@react-native-community/netinfo";
// import flattenUploadParams from "components/Suggestions/helpers/flattenUploadParams.ts";
import _ from "lodash";
import { useMemo } from "react";

import filterSuggestions from "./filterSuggestions";
import useOfflineSuggestions from "./useOfflineSuggestions";
import useOnlineSuggestions from "./useOnlineSuggestions";

// const createUploadParams = async ( uri, observation ) => {
//   const newImageParams = await flattenUploadParams( uri );
//   if ( observation?.latitude ) {
//     newImageParams.lat = observation?.latitude;
//     newImageParams.lng = observation?.longitude;
//   }
//   return newImageParams;
// };

// const setQueryKey = ( selectedPhotoUri, shouldUseEvidenceLocation ) => [
//   "scoreImage",
//   selectedPhotoUri,
//   { shouldUseEvidenceLocation }
// ];

export const useMatchSuggestions = ( photoUri, options ) => {
  const { isConnected } = useNetInfo( );
  const {
    onFetchError,
    onFetched,
    scoreImageParams,
    queryKey
  } = options;

  const {
    offlineSuggestions
  } = useOfflineSuggestions( photoUri, {
    onFetched,
    onFetchError,
    latitude: scoreImageParams?.lat,
    longitude: scoreImageParams?.lng,
    tryOfflineSuggestions: true
  } );

  const {
    dataUpdatedAt: onlineSuggestionsUpdatedAt,
    error: onlineSuggestionsError,
    onlineSuggestions,
    timedOut,
    resetTimeout
  } = useOnlineSuggestions( {
    onFetchError,
    onFetched,
    scoreImageParams,
    queryKey,
    shouldFetchOnlineSuggestions: true
  } );

  const onlineSuggestionsResponse = {
    onlineSuggestionsUpdatedAt,
    onlineSuggestionsError,
    onlineSuggestions,
    timedOut,
    resetTimeout
  };

  // 20240815 amanda - it's conceivable that we would want to use a cached image here eventually,
  // since the user can see the small square version of this image in MyObs/ObsDetails already
  // but for now, passing in an https photo to predictImage while offline crashes the app
  const urlWillCrashOffline = photoUri?.includes( "https://" ) && !isConnected;

  const usingOfflineSuggestions = offlineSuggestions.length > 0
      && ( !onlineSuggestions || onlineSuggestions?.results?.length === 0 );

  const hasOnlineSuggestionResults = onlineSuggestions?.results?.length > 0;

  const unfilteredSuggestions = hasOnlineSuggestionResults
    ? onlineSuggestions.results
    : offlineSuggestions;

  // since we can calculate this, there's no need to store it in state
  const suggestions = useMemo(
    ( ) => filterSuggestions(
      unfilteredSuggestions,
      usingOfflineSuggestions,
      onlineSuggestions?.common_ancestor
    ),
    [
      unfilteredSuggestions,
      usingOfflineSuggestions,
      onlineSuggestions?.common_ancestor
    ]
  );

  return {
    ...onlineSuggestionsResponse,
    suggestions,
    usingOfflineSuggestions,
    urlWillCrashOffline
  };
};

export default useMatchSuggestions;
