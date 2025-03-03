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

export {
  findInitialTopSuggestionAndOtherSuggestions,
  findPhotoUriFromCurrentObservation,
  reorderSuggestionsAfterNewSelection,
  saveTaxaFromOnlineSuggestionsToRealm,
  sortSuggestionsForMatch
};
