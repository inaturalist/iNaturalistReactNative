// @flow

import { useRoute } from "@react-navigation/native";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import _ from "lodash";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect,
  useState
} from "react";
import ObservationPhoto from "realmModels/ObservationPhoto";
import useStore from "stores/useStore";

import useClearComputerVisionDirectory from "./hooks/useClearComputerVisionDirectory";
import useNavigateWithTaxonSelected from "./hooks/useNavigateWithTaxonSelected";
import useOfflineSuggestions from "./hooks/useOfflineSuggestions";
import useOnlineSuggestions from "./hooks/useOnlineSuggestions";
import Suggestions from "./Suggestions";

const HUMAN_ID = 43584;

const SuggestionsContainer = ( ): Node => {
  // clearing the cache of resized images for the score_image API
  // placing this here means we can keep the app size small
  // and only have the latest resized image stored in computerVisionSuggestions
  useClearComputerVisionDirectory( );
  const { params } = useRoute( );
  const currentObservation = useStore( state => state.currentObservation );
  const hasVisionSuggestion = params?.hasVisionSuggestion && currentObservation?.taxon;
  const innerPhotos = ObservationPhoto.mapInnerPhotos( currentObservation );
  const photoUris = ObservationPhoto.mapObsPhotoUris( currentObservation );

  const [selectedPhotoUri, setSelectedPhotoUri] = useState( photoUris[0] );
  const [selectedTaxon, setSelectedTaxon] = useState( null );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );
  const [isLoading, setIsLoading] = useState( true );

  const {
    dataUpdatedAt: onlineSuggestionsUpdatedAt,
    error: onlineSuggestionsError,
    onlineSuggestions,
    loadingOnlineSuggestions,
    timedOut,
    refetch,
    isRefetching
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

  useNavigateWithTaxonSelected(
    selectedTaxon,
    ( ) => setSelectedTaxon( null ),
    { vision: true }
  );

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

  const unfilteredSuggestions = onlineSuggestions?.results?.length > 0
    ? onlineSuggestions.results
    : offlineSuggestions;

  const hasSuggestions = unfilteredSuggestions.length > 0;
  const humanSuggestion = _.find( unfilteredSuggestions, s => s.taxon.id === HUMAN_ID );

  const filterSuggestions = ( ) => {
    if ( isLoading ) { return []; }
    if ( humanSuggestion ) {
      return [];
    }
    if ( hasVisionSuggestion ) {
      return unfilteredSuggestions.filter(
        result => result?.taxon?.id !== currentObservation?.taxon?.id
      ).map( r => r );
    }
    return unfilteredSuggestions;
  };

  useEffect( ( ) => {
    if ( hasSuggestions || loadingOfflineSuggestions === false ) {
      setIsLoading( false );
    }
  }, [loadingOfflineSuggestions, hasSuggestions] );

  const otherSuggestions = filterSuggestions( );

  const filterTopSuggestions = ( ) => {
    if ( isLoading ) { return []; }
    if ( humanSuggestion ) {
      return humanSuggestion;
    }
    if ( hasVisionSuggestion ) {
      return currentObservation;
    }
    if ( onlineSuggestions?.results?.length > 0 ) {
      return onlineSuggestions?.common_ancestor;
    }
    // if ( otherSuggestions?.length > 0 ) {
    //   const firstSuggestion = otherSuggestions.shift( );
    //   return firstSuggestion;
    // }
    return [];
  };

  const topSuggestion = filterTopSuggestions( );

  return (
    <>
      <Suggestions
        debugData={debugData}
        loading={isLoading || isRefetching}
        onPressPhoto={onPressPhoto}
        onTaxonChosen={setSelectedTaxon}
        photoUris={photoUris}
        reloadSuggestions={refetch}
        selectedPhotoUri={selectedPhotoUri}
        otherSuggestions={otherSuggestions}
        topSuggestion={topSuggestion}
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
