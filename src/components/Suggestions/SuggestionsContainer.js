// @flow

import { useRoute } from "@react-navigation/native";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect,
  useState
} from "react";
import ObservationPhoto from "realmModels/ObservationPhoto";
import useStore from "stores/useStore";

import useNavigateWithTaxonSelected from "./hooks/useNavigateWithTaxonSelected";
import useOfflineSuggestions from "./hooks/useOfflineSuggestions";
import useOnlineSuggestions from "./hooks/useOnlineSuggestions";
import Suggestions from "./Suggestions";

const SuggestionsContainer = ( ): Node => {
  const { params } = useRoute( );
  const currentObservation = useStore( state => state.currentObservation );
  const innerPhotos = ObservationPhoto.mapInnerPhotos( currentObservation );
  const photoUris = ObservationPhoto.mapObsPhotoUris( currentObservation );
  const [selectedPhotoUri, setSelectedPhotoUri] = useState( photoUris[photoUris.length - 1] );
  const [selectedTaxon, setSelectedTaxon] = useState( null );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );
  const [isLoading, setIsLoading] = useState( true );

  const {
    dataUpdatedAt: onlineSuggestionsUpdatedAt,
    error: onlineSuggestionsError,
    onlineSuggestions,
    loadingOnlineSuggestions,
    timedOut
  } = useOnlineSuggestions( selectedPhotoUri );

  // skip to offline suggestions if internet connection is spotty
  const tryOfflineSuggestions = timedOut || (
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

  useNavigateWithTaxonSelected( selectedTaxon, { vision: true } );

  const onPressPhoto = useCallback(
    uri => {
      if ( uri === selectedPhotoUri ) {
        setMediaViewerVisible( true );
      }
      setSelectedPhotoUri( uri );
    },
    [selectedPhotoUri]
  );

  const usingOfflineSuggestions = tryOfflineSuggestions && offlineSuggestions?.length > 0;

  const debugData = {
    timedOut,
    onlineSuggestions,
    offlineSuggestions,
    onlineSuggestionsError,
    onlineSuggestionsUpdatedAt,
    selectedPhotoUri
  };

  const suggestions = onlineSuggestions?.results?.length > 0
    ? onlineSuggestions.results
    : offlineSuggestions;

  const hasSuggestions = suggestions.length > 0;

  useEffect( ( ) => {
    if ( hasSuggestions || loadingOfflineSuggestions === false ) {
      setIsLoading( false );
    }
  }, [loadingOfflineSuggestions, hasSuggestions] );

  return (
    <>
      <Suggestions
        commonAncestor={onlineSuggestions?.common_ancestor}
        debugData={debugData}
        hasVisionSuggestion={params?.hasVisionSuggestion}
        loading={isLoading}
        onPressPhoto={onPressPhoto}
        onTaxonChosen={setSelectedTaxon}
        photoUris={photoUris}
        selectedPhotoUri={selectedPhotoUri}
        suggestions={suggestions}
        usingOfflineSuggestions={usingOfflineSuggestions}
      />
      <MediaViewerModal
        showModal={mediaViewerVisible}
        onClose={() => setMediaViewerVisible( false )}
        uri={selectedPhotoUri}
        photos={innerPhotos}
      />
    </>
  );
};

export default SuggestionsContainer;
