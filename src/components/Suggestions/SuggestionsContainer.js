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
  } = useOnlineSuggestions( selectedPhotoUri );
  const {
    offlineSuggestions,
    loadingOfflineSuggestions
  } = useOfflineSuggestions( selectedPhotoUri, {
    tryOfflineSuggestions: onlineSuggestions?.length === 0
  } );

  const nearbySuggestions = onlineSuggestions?.length > 0
    ? onlineSuggestions
    : offlineSuggestions;

  const taxonIds = nearbySuggestions?.map(
    suggestion => suggestion.taxon.id
  );

  const observers = useObservers( taxonIds );

  useTaxonSelected( selectedTaxon, { vision: true } );

  const loadingSuggestions = ( loadingOnlineSuggestions || loadingOfflineSuggestions )
    && photoList.length > 0;

  return (
    <Suggestions
      loadingSuggestions={loadingSuggestions}
      nearbySuggestions={nearbySuggestions}
      onTaxonChosen={setSelectedTaxon}
      photoUris={photoList}
      selectedPhotoUri={selectedPhotoUri}
      setSelectedPhotoUri={setSelectedPhotoUri}
      observers={observers}
    />
  );
};

export default SuggestionsContainer;
