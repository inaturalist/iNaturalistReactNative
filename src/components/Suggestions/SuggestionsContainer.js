// @flow

import type { Node } from "react";
import React, {
  useState
} from "react";
import ObservationPhoto from "realmModels/ObservationPhoto";
import useStore from "stores/useStore";

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
    offlineSuggestions,
    loadingOfflineSuggestions
  } = useOfflineSuggestions( selectedPhotoUri );
  const {
    onlineSuggestions,
    loadingOnlineSuggestions
  } = useOnlineSuggestions( selectedPhotoUri, {
    tryOnlineSuggestions: offlineSuggestions.length === 0
  } );

  const nearbySuggestions = offlineSuggestions?.length > 0
    ? offlineSuggestions
    : onlineSuggestions;

  const taxonIds = nearbySuggestions?.map(
    suggestion => suggestion.taxon.id
  );

  useTaxonSelected( selectedTaxon, { vision: true } );

  const loadingSuggestions = ( loadingOfflineSuggestions || loadingOnlineSuggestions )
    && photoList.length > 0;

  return (
    <Suggestions
      loadingSuggestions={loadingSuggestions}
      nearbySuggestions={nearbySuggestions}
      onTaxonChosen={setSelectedTaxon}
      photoUris={photoList}
      selectedPhotoUri={selectedPhotoUri}
      setSelectedPhotoUri={setSelectedPhotoUri}
      taxonIds={taxonIds}
    />
  );
};

export default SuggestionsContainer;
