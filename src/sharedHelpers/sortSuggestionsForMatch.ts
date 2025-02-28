import _ from "lodash";

const sortSuggestionsForMatch = suggestionsList => {
  const sortedList = _.orderBy(
    suggestionsList,
    suggestion => suggestion.combined_score,
    ["desc"]
  );

  return sortedList;
};

const reorderSuggestionsAfterNewSelection = ( selection, suggestions ) => {
  const suggestionsList = [...suggestions];

  // make sure to reorder the list by confidence score
  // for when a user taps multiple suggestions and pushes a new top suggestion to
  // the top of the list
  const sortedList = sortSuggestionsForMatch( suggestionsList );

  const chosenIndex = _.findIndex(
    sortedList,
    suggestion => suggestion.taxon.id === selection.taxon.id
  );

  if ( chosenIndex === -1 ) {
    return null;
  }
  return {
    topSuggestion: sortedList[chosenIndex],
    otherSuggestions: sortedList
  };
};

const findInitialTopSuggestionAndOtherSuggestions = suggestionsList => {
  const suggestions = sortSuggestionsForMatch( suggestionsList );
  const topSuggestion = suggestions[0];
  const otherSuggestions = _.tail( suggestions );
  return {
    topSuggestion,
    otherSuggestions
  };
};

export {
  findInitialTopSuggestionAndOtherSuggestions,
  reorderSuggestionsAfterNewSelection,
  sortSuggestionsForMatch
};
