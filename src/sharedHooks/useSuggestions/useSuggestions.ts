import { useNetInfo } from "@react-native-community/netinfo";
import { useMemo } from "react";

import filterSuggestions from "./filterSuggestions";
import type { UseSuggestionsOptions, UseSuggestionsResult } from "./types";
import useOfflineSuggestions from "./useOfflineSuggestions";
import useOnlineSuggestions from "./useOnlineSuggestions";

export const useSuggestions = (
  photoUri: string,
  options: UseSuggestionsOptions
): UseSuggestionsResult => {
  const { isConnected } = useNetInfo( );
  const {
    shouldFetchOnlineSuggestions,
    onFetchError,
    onFetched,
    scoreImageParams,
    queryKey,
    onlineSuggestionsAttempted
  } = options;

  const {
    dataUpdatedAt: onlineSuggestionsUpdatedAt,
    error: onlineSuggestionsError,
    onlineSuggestions,
    refetch: refetchOnlineSuggestions,
    timedOut,
    resetTimeout
  } = useOnlineSuggestions( {
    onFetchError,
    onFetched,
    scoreImageParams,
    queryKey,
    shouldFetchOnlineSuggestions
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

  // skip to offline suggestions if internet connection is spotty
  const fallingBackToOfflineSuggestions = timedOut
    || !isConnected
    || ( !onlineSuggestions && onlineSuggestionsAttempted );
  const tryOfflineSuggestions = !urlWillCrashOffline && fallingBackToOfflineSuggestions;

  const {
    offlineSuggestions,
    refetchOfflineSuggestions
  } = useOfflineSuggestions( photoUri, {
    onFetched,
    onFetchError,
    latitude: scoreImageParams?.lat,
    longitude: scoreImageParams?.lng,
    tryOfflineSuggestions
  } );
  console.log( { offlineSuggestions, onlineSuggestions } );

  const refetchSuggestions = () => {
    if ( shouldFetchOnlineSuggestions ) {
      refetchOnlineSuggestions();
    }
    if ( tryOfflineSuggestions ) {
      refetchOfflineSuggestions();
    }
  };
  const hasOnlineSuggestionResults = ( onlineSuggestions?.results?.length || 0 ) > 0;
  const hasOfflineSuggestionResults = ( offlineSuggestions?.results?.length || 0 ) > 0;

  const usingOfflineSuggestions = fallingBackToOfflineSuggestions || (
    hasOfflineSuggestionResults && !hasOnlineSuggestionResults && onlineSuggestionsAttempted
  );

  const unfilteredSuggestions = useMemo(
    ( ) => ( hasOnlineSuggestionResults
      ? onlineSuggestions!.results || []
      : offlineSuggestions?.results || [] ),
    [hasOnlineSuggestionResults, onlineSuggestions, offlineSuggestions]
  );

  const commonAncestor = hasOnlineSuggestionResults
    ? onlineSuggestions?.common_ancestor
    : offlineSuggestions?.commonAncestor;

  // since we can calculate this, there's no need to store it in state
  const suggestions = useMemo(
    ( ) => filterSuggestions(
      unfilteredSuggestions,
      commonAncestor
    ),
    [
      unfilteredSuggestions,
      commonAncestor
    ]
  );

  return {
    ...onlineSuggestionsResponse,
    suggestions,
    usingOfflineSuggestions,
    urlWillCrashOffline,
    refetchSuggestions
  };
};

export default useSuggestions;
