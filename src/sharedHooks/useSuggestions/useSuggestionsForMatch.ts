import _ from "lodash";
import { useEffect, useMemo, useRef } from "react";
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

  // Track previous suggestion sources to detect changes
  const previousSourcesRef = useRef( {
    offlineLength: 0,
    onlineLength: 0,
    timedOut: false
  } );

  useOfflineSuggestionsForMatch( );
  useOnlineSuggestionsForMatch( );

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
      onlineLength: onlineSuggestions.length,
      timedOut
    };

    const sourcesChanged
    = currentSources.offlineLength !== previousSourcesRef.current.offlineLength
    || currentSources.onlineLength !== previousSourcesRef.current.onlineLength
    || currentSources.timedOut !== previousSourcesRef.current.timedOut;

    // Only update if sources changed to avoid render loops
    if ( sourcesChanged ) {
      const initialSuggestions = findInitialTopSuggestionAndOtherSuggestions( suggestions );
      const newSuggestionsList = convertSuggestionsObjToList( initialSuggestions );
      setSuggestionsList( newSuggestionsList );
      // Update previous sources ref
      previousSourcesRef.current = currentSources;
    }
  }, [
    suggestions,
    setSuggestionsList,
    offlineSuggestions.length,
    onlineSuggestions.length,
    timedOut
  ] );

  return suggestions;
};

export default useSuggestionsForMatch;
