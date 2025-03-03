import _ from "lodash";
import { useEffect, useMemo, useRef } from "react";
import {
  findInitialTopSuggestionAndOtherSuggestions
} from "sharedHelpers/sortSuggestionsForMatch.ts";
import useStore from "stores/useStore";

import filterSuggestions from "./filterSuggestions";
import useOfflineSuggestionsForMatch from "./useOfflineSuggestionsForMatch";
// import useOnlineSuggestionsForMatch from "./useOnlineSuggestionsForMatch";

const convertSuggestionsObjToList = suggestions => {
  const matchSuggestionsList = [...suggestions.otherSuggestions];

  if ( suggestions?.topSuggestion ) {
    matchSuggestionsList.unshift( suggestions?.topSuggestion );
  }
  return matchSuggestionsList;
};

const useSuggestionsForMatch = ( ) => {
  const offlineSuggestions = useStore( state => state.offlineSuggestions );
  const onlineSuggestions = useStore( state => state.onlineSuggestions );
  const commonAncestor = useStore( state => state.commonAncestor );
  const setTopAndOtherSuggestions = useStore( state => state.setTopAndOtherSuggestions );
  const setSuggestionsList = useStore( state => state.setSuggestionsList );

  // Track previous suggestion sources to detect changes
  const previousSourcesRef = useRef( {
    offlineLength: 0,
    onlineLength: 0
  } );

  useOfflineSuggestionsForMatch( );
  // useOnlineSuggestionsForMatch( );

  const unfilteredSuggestions = useMemo(
    () => ( onlineSuggestions.length > 0
      ? onlineSuggestions
      : offlineSuggestions ),
    [onlineSuggestions, offlineSuggestions]
  );

  const usingOfflineSuggestions = useMemo(
    () => offlineSuggestions.length > 0 && ( !onlineSuggestions || onlineSuggestions.length === 0 ),
    [offlineSuggestions.length, onlineSuggestions]
  );

  // since we can calculate this, there's no need to store it in state
  const suggestions = useMemo( ( ) => {
    const filteredSuggestions = filterSuggestions(
      unfilteredSuggestions,
      usingOfflineSuggestions,
      commonAncestor
    );

    const matchSuggestionsList = convertSuggestionsObjToList( filteredSuggestions );
    return matchSuggestionsList;
  }, [
    unfilteredSuggestions,
    usingOfflineSuggestions,
    commonAncestor
  ] );

  useEffect( ( ) => {
    // Skip if no suggestions available yet
    if ( offlineSuggestions.length === 0 && onlineSuggestions.length === 0 ) {
      return;
    }

    // Check if suggestion sources have changed to avoid unnecessary updates
    const currentSources = {
      offlineLength: offlineSuggestions.length,
      onlineLength: onlineSuggestions.length
    };

    const sourcesChanged
    = currentSources.offlineLength !== previousSourcesRef.current.offlineLength
    || currentSources.onlineLength !== previousSourcesRef.current.onlineLength;

    // Only update if sources changed to avoid render loops
    if ( sourcesChanged ) {
      const initialSuggestions = findInitialTopSuggestionAndOtherSuggestions( suggestions );
      const {
        topSuggestion: newTopSuggestion,
        otherSuggestions: newOtherSuggestions
      } = initialSuggestions;
      setTopAndOtherSuggestions( newTopSuggestion, newOtherSuggestions );
      setSuggestionsList( initialSuggestions );
      // Update previous sources ref
      previousSourcesRef.current = currentSources;
    }
  }, [
    suggestions,
    setTopAndOtherSuggestions,
    setSuggestionsList,
    offlineSuggestions.length,
    onlineSuggestions.length
  ] );

  return suggestions;
};

export default useSuggestionsForMatch;
