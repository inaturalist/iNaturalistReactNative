// @flow

import type { Node } from "react";
import React, {
  useState
} from "react";
import ObservationPhoto from "realmModels/ObservationPhoto";
import useStore from "stores/useStore";

import useOfflineSuggestions from "./hooks/useOfflineSuggestions";
// import useOnlineSuggestions from "./hooks/useOnlineSuggestions";
import useTaxonSelected from "./hooks/useTaxonSelected";
import Suggestions from "./Suggestions";

const SuggestionsContainer = ( ): Node => {
  const currentObservation = useStore( state => state.currentObservation );
  const photoList = ObservationPhoto.mapObsPhotoUris( currentObservation );
  const [selectedPhotoUri, setSelectedPhotoUri] = useState( photoList[0] );
  const [selectedTaxon, setSelectedTaxon] = useState( null );

  const {
    offlineSuggestions: nearbySuggestions,
    loadingOfflineSuggestions: loadingSuggestions
  } = useOfflineSuggestions( selectedPhotoUri );
  // const {
  //   onlineSuggestions,
  //   loadingOnlineSuggestions
  // } = useOnlineSuggestions( selectedPhotoUri );

  useTaxonSelected( selectedTaxon, { vision: true } );

  return (
    <Suggestions
      loadingSuggestions={loadingSuggestions && photoList.length > 0}
      nearbySuggestions={nearbySuggestions}
      onTaxonChosen={setSelectedTaxon}
      photoUris={photoList}
      selectedPhotoUri={selectedPhotoUri}
      setSelectedPhotoUri={setSelectedPhotoUri}
    />
  );
};

export default SuggestionsContainer;
