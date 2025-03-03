import _ from "lodash";
import { useEffect, useMemo } from "react";
import {
  findInitialTopSuggestionAndOtherSuggestions
} from "sharedHelpers/sortSuggestionsForMatch.ts";
import useStore from "stores/useStore";

import filterSuggestions from "./filterSuggestions";
import useOfflineSuggestionsForMatch from "./useOfflineSuggestionsForMatch";
import useOnlineSuggestionsForMatch from "./useOnlineSuggestionsForMatch";

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

  useOfflineSuggestionsForMatch( );
  useOnlineSuggestionsForMatch( );

  const unfilteredSuggestions = onlineSuggestions.length > 0
    ? onlineSuggestions
    : offlineSuggestions;

  const usingOfflineSuggestions = offlineSuggestions.length > 0
    && ( !onlineSuggestions || onlineSuggestions.length === 0 );

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
    const initialSuggestions = findInitialTopSuggestionAndOtherSuggestions( suggestions );
    const {
      topSuggestion: newTopSuggestion,
      otherSuggestions: newOtherSuggestions
    } = initialSuggestions;
    setTopAndOtherSuggestions( newTopSuggestion, newOtherSuggestions );
    setSuggestionsList( initialSuggestions );
  }, [suggestions, setTopAndOtherSuggestions, setSuggestionsList] );

  return suggestions;
};

export default useSuggestionsForMatch;
