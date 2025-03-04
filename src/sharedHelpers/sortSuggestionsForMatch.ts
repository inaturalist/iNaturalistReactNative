import _ from "lodash";
import Taxon from "realmModels/Taxon";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";

const sortSuggestionsForMatch = suggestionsList => {
  const sortedList = _.orderBy(
    suggestionsList,
    suggestion => suggestion.combined_score,
    ["desc"]
  );

  return sortedList;
};

const reorderSuggestionsWithSelectionFirst = ( selection, suggestions ) => {
  const suggestionsList = [...suggestions];

  const selectedIndex = _.findIndex(
    suggestionsList,
    suggestion => suggestion.taxon.id === selection.taxon.id
  );

  // If selection is not in the list, return the original list
  if ( selectedIndex === -1 ) {
    return suggestionsList;
  }

  // Remove the selection from the array and add as first item
  const selectedSuggestion = suggestionsList.splice( selectedIndex, 1 )[0];
  suggestionsList.unshift( selectedSuggestion );

  return suggestionsList;
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

const saveTaxaFromOnlineSuggestionsToRealm = ( onlineSuggestions, realm ) => {
  // we're already getting all this taxon information anytime we make this API
  // call, so we might as well store it in realm immediately instead of waiting
  // for useTaxon to fetch individual taxon results
  const mappedTaxa = onlineSuggestions?.results?.map(
    suggestion => Taxon.mapApiToRealm( suggestion.taxon, realm )
  );
  if ( onlineSuggestions?.common_ancestor ) {
    const mappedCommonAncestor = Taxon
      .mapApiToRealm( onlineSuggestions?.common_ancestor.taxon, realm );
    mappedTaxa.push( mappedCommonAncestor );
  }
  safeRealmWrite( realm, ( ) => {
    mappedTaxa.forEach( remoteTaxon => {
      realm.create(
        "Taxon",
        Taxon.forUpdate( remoteTaxon ),
        "modified"
      );
    } );
  }, "saving remote taxon from onlineSuggestions" );
};

const findPhotoUriFromCurrentObservation = observation => {
  const obsPhotos = observation?.observationPhotos;

  return obsPhotos?.[0]?.photo?.url
    || obsPhotos?.[0]?.photo?.localFilePath;
};

const convertSuggestionsObjToList = suggestions => {
  const matchSuggestionsList = [...suggestions.otherSuggestions];

  if ( suggestions?.topSuggestion ) {
    matchSuggestionsList.unshift( suggestions?.topSuggestion );
  }
  return matchSuggestionsList;
};

export {
  convertSuggestionsObjToList,
  findInitialTopSuggestionAndOtherSuggestions,
  findPhotoUriFromCurrentObservation,
  reorderSuggestionsWithSelectionFirst,
  saveTaxaFromOnlineSuggestionsToRealm,
  sortSuggestionsForMatch
};
