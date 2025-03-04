import {
  FETCH_STATUS_ONLINE_ERROR,
  FETCH_STATUS_ONLINE_FETCHED
} from "components/Suggestions/SuggestionsContainer.tsx";
import _ from "lodash";
import { useEffect, useMemo } from "react";
import {
  convertSuggestionsObjToList,
  findInitialTopSuggestionAndOtherSuggestions
} from "sharedHelpers/sortSuggestionsForMatch.ts";
import useStore from "stores/useStore";

import filterSuggestions from "./filterSuggestions";
import useOfflineSuggestionsForMatch from "./useOfflineSuggestionsForMatch";
import useOnlineSuggestionsForMatch from "./useOnlineSuggestionsForMatch";

const useSuggestionsForMatch = ( ) => {
  const offlineSuggestions = useStore( state => state.offlineSuggestions );
  const onlineSuggestions = useStore( state => state.onlineSuggestions );
  const commonAncestor = useStore( state => state.commonAncestor );
  const setSuggestionsList = useStore( state => state.setSuggestionsList );
  const timedOut = useStore( state => state.timedOut );
  const fetchStatus = useStore( state => state.fetchStatus );

  useOfflineSuggestionsForMatch( );
  useOnlineSuggestionsForMatch( );

  const unfilteredSuggestions = useMemo(
    () => ( onlineSuggestions.length > 0
      ? onlineSuggestions
      : offlineSuggestions ),
    [onlineSuggestions, offlineSuggestions]
  );

  // since we can calculate this, there's no need to store it in state
  const suggestions = useMemo( ( ) => {
    const filteredSuggestions = filterSuggestions(
      unfilteredSuggestions,
      commonAncestor
    );

    const matchSuggestionsList = convertSuggestionsObjToList( filteredSuggestions );
    return matchSuggestionsList;
  }, [
    unfilteredSuggestions,
    commonAncestor
  ] );

  useEffect( ( ) => {
    // Skip if no suggestions available yet
    if ( offlineSuggestions.length === 0 && onlineSuggestions.length === 0 ) {
      return;
    }

    if ( onlineSuggestions.length > 0
        || timedOut
        || fetchStatus === FETCH_STATUS_ONLINE_FETCHED
        || fetchStatus === FETCH_STATUS_ONLINE_ERROR ) {
      const initialSuggestions = findInitialTopSuggestionAndOtherSuggestions( suggestions );
      const newSuggestionsList = convertSuggestionsObjToList( initialSuggestions );
      setSuggestionsList( newSuggestionsList );
    }
  }, [
    fetchStatus,
    offlineSuggestions.length,
    onlineSuggestions.length,
    setSuggestionsList,
    suggestions,
    timedOut
  ] );

  return suggestions;
};

export default useSuggestionsForMatch;
