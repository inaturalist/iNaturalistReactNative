import { useNetInfo } from "@react-native-community/netinfo";
import _ from "lodash";
import { useMemo } from "react";

import isolateHumans, { humanFilter } from "./isolateHumans";
import sortSuggestions from "./sortSuggestions";
import useOfflineSuggestions from "./useOfflineSuggestions";
import useOnlineSuggestions from "./useOnlineSuggestions";

const initialSuggestions = {
  otherSuggestions: [],
  topSuggestion: null,
  topSuggestionType: "none"
};

const ONLINE_THRESHOLD = 78;
// note: offline threshold may need to change based on input from the CV team
const OFFLINE_THRESHOLD = 0.78;

const filterSuggestions = ( suggestionsToFilter, usingOfflineSuggestions, commonAncestor ) => {
  const sortedSuggestions = sortSuggestions(
    isolateHumans( suggestionsToFilter ),
    { usingOfflineSuggestions }
  );
  const newSuggestions = {
    ...initialSuggestions,
    otherSuggestions: sortedSuggestions
  };
  // no suggestions
  if ( sortedSuggestions.length === 0 ) {
    return {
      ...newSuggestions,
      otherSuggestions: [],
      topSuggestionType: "none"
    };
  }
  // human top suggestion
  if ( sortedSuggestions.find( humanFilter ) ) {
    return {
      ...newSuggestions,
      topSuggestion: sortedSuggestions[0],
      topSuggestionType: "human",
      otherSuggestions: []
    };
  }

  // Note: score_vision responses have combined_score values between 0 and
  // 100, compared with offline model results that have scores between 0
  // and 1
  const filterCriteria = usingOfflineSuggestions
    ? s => s.score > OFFLINE_THRESHOLD
    : s => s.combined_score > ONLINE_THRESHOLD;

  const suggestionAboveThreshold = _.find(
    sortedSuggestions,
    filterCriteria
  );

  if ( suggestionAboveThreshold ) {
    // make sure we're not returning the top suggestion in Other Suggestions
    const firstSuggestion = _.remove(
      sortedSuggestions,
      s => s.taxon.id === suggestionAboveThreshold.taxon.id
    ).at( 0 );
    return {
      ...newSuggestions,
      topSuggestion: firstSuggestion,
      topSuggestionType: usingOfflineSuggestions
        ? "above-offline-threshold"
        : "above-online-threshold"
    };
  }
  if ( !suggestionAboveThreshold && usingOfflineSuggestions ) {
    // no top suggestion for offline
    return {
      ...newSuggestions,
      topSuggestion: null,
      topSuggestionType: "not-confident"
    };
  }

  // online common ancestor
  if ( commonAncestor ) {
    return {
      ...newSuggestions,
      topSuggestion: commonAncestor,
      topSuggestionType: "common-ancestor"
    };
  }

  // no top suggestion
  return {
    ...newSuggestions,
    topSuggestionType: "not-confident"
  };
};

export const useSuggestions = ( {
  shouldFetchOnlineSuggestions,
  dispatch,
  flattenedUploadParams,
  queryKey,
  selectedPhotoUri,
  onlineSuggestionsAttempted
} ) => {
  const { isConnected } = useNetInfo( );

  const {
    dataUpdatedAt: onlineSuggestionsUpdatedAt,
    error: onlineSuggestionsError,
    onlineSuggestions,
    timedOut,
    resetTimeout
  } = useOnlineSuggestions( {
    dispatch,
    flattenedUploadParams,
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
  const urlWillCrashOffline = selectedPhotoUri.includes( "https://" ) && !isConnected;

  // skip to offline suggestions if internet connection is spotty
  const tryOfflineSuggestions = !urlWillCrashOffline && (
    timedOut
    || (
      ( !onlineSuggestions || onlineSuggestions?.results?.length === 0 )
      && onlineSuggestionsAttempted )
  );

  const {
    offlineSuggestions
  } = useOfflineSuggestions( selectedPhotoUri, {
    dispatch,
    latitude: flattenedUploadParams?.lat,
    longitude: flattenedUploadParams?.lng,
    tryOfflineSuggestions
  } );

  const usingOfflineSuggestions = tryOfflineSuggestions || (
    offlineSuggestions.length > 0
      && ( !onlineSuggestions || onlineSuggestions?.results?.length === 0 )
  );

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

export default useSuggestions;
