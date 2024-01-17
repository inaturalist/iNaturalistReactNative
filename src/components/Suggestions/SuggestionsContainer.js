// @flow

import type { Node } from "react";
import React, {
  useState
} from "react";
import ObservationPhoto from "realmModels/ObservationPhoto";
import useStore from "stores/useStore";

import useObservers from "./hooks/useObservers";
import useOfflineSuggestions from "./hooks/useOfflineSuggestions";
import useOnlineSuggestions from "./hooks/useOnlineSuggestions";
import useTaxonSelected from "./hooks/useTaxonSelected";
import Suggestions from "./Suggestions";

const SuggestionsContainer = ( ): Node => {
  const currentObservation = useStore( state => state.currentObservation );
  const photoList = ObservationPhoto.mapObsPhotoUris( currentObservation );
  const [selectedPhotoUri, setSelectedPhotoUri] = useState( photoList[0] );
  const [selectedTaxon, setSelectedTaxon] = useState( null );

  const {
    onlineSuggestions,
    loadingOnlineSuggestions
  } = useOnlineSuggestions( selectedPhotoUri, {
    latitude: currentObservation?.latitude,
    longitude: currentObservation?.longitude
  } );

  const tryOfflineSuggestions = (
    // Don't try offline while online is loading
    !loadingOnlineSuggestions
    && (
      // Don't bother with offline if we have some online suggestions
      !onlineSuggestions
      || onlineSuggestions?.results?.length === 0
    )
  );
  const {
    offlineSuggestions,
    loadingOfflineSuggestions
  } = useOfflineSuggestions( selectedPhotoUri, {
    tryOfflineSuggestions
  } );

  const suggestions = onlineSuggestions?.results?.length > 0
    ? onlineSuggestions.results
    : offlineSuggestions;

  const topSuggestion = onlineSuggestions?.common_ancestor;

  const taxonIds = suggestions?.map(
    suggestion => suggestion.taxon.id
  );

  const observers = useObservers( taxonIds );

  useTaxonSelected( selectedTaxon, { vision: true } );

  const loadingSuggestions = ( loadingOnlineSuggestions || loadingOfflineSuggestions )
    && photoList.length > 0;

  return (
    <Suggestions
      loadingSuggestions={loadingSuggestions}
      topSuggestion={topSuggestion}
      suggestions={suggestions}
      onTaxonChosen={setSelectedTaxon}
      photoUris={photoList}
      selectedPhotoUri={selectedPhotoUri}
      setSelectedPhotoUri={setSelectedPhotoUri}
      observers={observers}
      usingOfflineSuggestions={tryOfflineSuggestions && offlineSuggestions?.length > 0}
    />
  );
};

export default SuggestionsContainer;
