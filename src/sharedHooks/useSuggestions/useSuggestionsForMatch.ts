import _ from "lodash";
import { useEffect, useMemo, useRef } from "react";
import {
  convertSuggestionsObjToList
} from "sharedHelpers/sortSuggestionsForMatch.ts";
import {
  FETCH_STATUS_ONLINE_DISCONNECTED,
  FETCH_STATUS_ONLINE_ERROR,
  FETCH_STATUS_ONLINE_FETCHED,
  FETCH_STATUS_ONLINE_SKIPPED,
  FETCH_STATUS_ONLINE_TIMED_OUT
} from "stores/createSuggestionsSlice.ts";
import useStore from "stores/useStore";

import filterSuggestions from "./filterSuggestions";
import useOfflineSuggestionsForMatch from "./useOfflineSuggestionsForMatch";
import useOnlineSuggestionsForMatch from "./useOnlineSuggestionsForMatch";

const onlineFetchStatuses = [
  FETCH_STATUS_ONLINE_ERROR,
  FETCH_STATUS_ONLINE_FETCHED,
  FETCH_STATUS_ONLINE_SKIPPED,
  FETCH_STATUS_ONLINE_TIMED_OUT,
  FETCH_STATUS_ONLINE_DISCONNECTED
];

const useSuggestionsForMatch = ( ) => {
  const fetchStatus = useStore( state => state.fetchStatus );
  const commonAncestor = useStore( state => state.commonAncestor );
  const offlineSuggestions = useStore( state => state.offlineSuggestions );
  const onlineSuggestions = useStore( state => state.onlineSuggestions );
  const setSuggestionsList = useStore( state => state.setSuggestionsList );
  const currentObservation = useStore( state => state.currentObservation );
  const resetSuggestionsSlice = useStore( state => state.resetSuggestionsSlice );

  // Track previous observation state to detect when location is added
  const prevObservationRef = useRef( currentObservation );

  // Determine if location was just added
  const wasLocationJustAdded = useMemo( () => {
    const prevObs = prevObservationRef.current;
    const currentObs = currentObservation;

    // Check if location was added (previously null/undefined but now exists)
    const locationJustAdded
        = prevObs && currentObs
        && ( ( !prevObs.latitude && currentObs.latitude )
        || ( !prevObs.longitude && currentObs.longitude ) );

    return locationJustAdded;
  }, [currentObservation] );

  // Update the ref after checking
  useEffect( () => {
    prevObservationRef.current = currentObservation;
  }, [currentObservation] );

  // If location was just added, reset the suggestions store
  useEffect( () => {
    if ( wasLocationJustAdded ) {
      resetSuggestionsSlice( );
    }
  }, [wasLocationJustAdded, resetSuggestionsSlice] );

  useOfflineSuggestionsForMatch( );
  useOnlineSuggestionsForMatch( );

  const shouldUpdateSuggestionsList = useMemo( ( ) => (
    onlineFetchStatuses.includes( fetchStatus )
  ), [fetchStatus] );

  useEffect( ( ) => {
    const unfilteredSuggestions = onlineSuggestions.length > 0
      ? onlineSuggestions
      : offlineSuggestions;

    const filteredSuggestions = filterSuggestions( unfilteredSuggestions, commonAncestor );

    if ( shouldUpdateSuggestionsList ) {
      const newSuggestionsList = convertSuggestionsObjToList( filteredSuggestions );
      setSuggestionsList( newSuggestionsList );
    }
  }, [
    shouldUpdateSuggestionsList,
    setSuggestionsList,
    commonAncestor,
    onlineSuggestions,
    offlineSuggestions
  ] );

  return null;
};

export default useSuggestionsForMatch;
