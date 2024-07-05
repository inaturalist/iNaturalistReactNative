import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import _ from "lodash";
import React, {
  useCallback,
  useEffect,
  useState
} from "react";
import ObservationPhoto from "realmModels/ObservationPhoto";
import {
  useIsConnected
} from "sharedHooks";
import useLocationPermission from "sharedHooks/useLocationPermission.tsx";
// import { log } from "sharedHelpers/logger";
import useStore from "stores/useStore";

import sortSuggestions from "./helpers/sortSuggestions";
import useClearComputerVisionDirectory from "./hooks/useClearComputerVisionDirectory";
import useNavigateWithTaxonSelected from "./hooks/useNavigateWithTaxonSelected";
import useOfflineSuggestions from "./hooks/useOfflineSuggestions";
import useOnlineSuggestions from "./hooks/useOnlineSuggestions";
import Suggestions from "./Suggestions";

// const logger = log.extend( "SuggestionsContainer" );

const initialSuggestions = {
  topSuggestion: null,
  otherSuggestions: [],
  topSuggestionType: "none",
  usingOfflineSuggestions: false,
  isLoading: true
};

const SuggestionsContainer = ( ) => {
  const isOnline = useIsConnected( );
  // clearing the cache of resized images for the score_image API
  // placing this here means we can keep the app size small
  // and only have the latest resized image stored in computerVisionSuggestions
  useClearComputerVisionDirectory( );
  const currentObservation = useStore( state => state.currentObservation );
  const innerPhotos = ObservationPhoto.mapInnerPhotos( currentObservation );
  const photoUris = ObservationPhoto.mapObsPhotoUris( currentObservation );

  const [selectedPhotoUri, setSelectedPhotoUri] = useState( photoUris[0] );
  const [selectedTaxon, setSelectedTaxon] = useState( null );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );
  const evidenceHasLocation = !!( currentObservation?.latitude ) || false;
  const [suggestions, setSuggestions] = useState( {
    ...initialSuggestions,
    showSuggestionsWithLocation: evidenceHasLocation
  } );
  const { hasPermissions, renderPermissionsGate, requestPermissions } = useLocationPermission( );
  const showImproveWithLocationButton = hasPermissions === false;
  // const showImproveWithLocationButton = !evidenceHasLocation
  //   && params?.lastScreen === "CameraWithDevice";
  const improveWithLocationButtonOnPress = useCallback( ( ) => {
    requestPermissions( );
  }, [requestPermissions] );

  const {
    showSuggestionsWithLocation,
    topSuggestion,
    otherSuggestions,
    usingOfflineSuggestions
  } = suggestions;

  const {
    dataUpdatedAt: onlineSuggestionsUpdatedAt,
    error: onlineSuggestionsError,
    onlineSuggestions,
    timedOut,
    refetchSuggestions,
    fetchStatus
  } = useOnlineSuggestions( selectedPhotoUri, {
    showSuggestionsWithLocation,
    usingOfflineSuggestions
  } );

  const loadingOnlineSuggestions = fetchStatus === "fetching";

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

  const hasOfflineSuggestions = tryOfflineSuggestions && offlineSuggestions?.length > 0;

  useNavigateWithTaxonSelected(
    selectedTaxon,
    ( ) => setSelectedTaxon( null ),
    { vision: true }
  );

  const onPressPhoto = useCallback(
    uri => {
      if ( uri === selectedPhotoUri ) {
        setMediaViewerVisible( true );
      } else {
        setSuggestions( initialSuggestions );
        setSelectedPhotoUri( uri );
      }
    },
    [
      selectedPhotoUri
    ]
  );

  const debugData = {
    timedOut,
    onlineSuggestions,
    offlineSuggestions,
    onlineSuggestionsError,
    onlineSuggestionsUpdatedAt,
    selectedPhotoUri,
    showSuggestionsWithLocation,
    topSuggestionType: suggestions.topSuggestionType,
    usingOfflineSuggestions: suggestions.usingOfflineSuggestions
  };

  const unfilteredSuggestions = onlineSuggestions?.results?.length > 0
    ? onlineSuggestions.results
    : offlineSuggestions;

  const filterSuggestions = useCallback( ( ) => {
    const removeTopSuggestion = ( list, id ) => _.remove( list, item => item.taxon.id === id );
    const sortedSuggestions = sortSuggestions( unfilteredSuggestions, {
      showSuggestionsWithLocation: suggestions.showSuggestionsWithLocation,
      hasOfflineSuggestions
    } );
    const newSuggestions = {
      ...suggestions,
      otherSuggestions: sortedSuggestions,
      usingOfflineSuggestions: hasOfflineSuggestions,
      isLoading: false
    };
    if ( sortedSuggestions.length === 0 ) {
      return {
        ...newSuggestions,
        otherSuggestions: [],
        topSuggestionType: "none"
      };
    }
    // return first sorted result if there's a human suggestion, if we're
    // using offline suggestions, or if there's only one suggestion
    if ( hasOfflineSuggestions || sortedSuggestions.length === 1 ) {
      const firstSuggestion = sortedSuggestions.shift( );
      return {
        ...newSuggestions,
        topSuggestion: firstSuggestion,
        topSuggestionType: "first-sorted"
      };
    }

    const suggestionAboveThreshold = _.find( sortedSuggestions, s => s.combined_score > 0.78 );
    if ( suggestionAboveThreshold ) {
      // make sure we're not returning the top suggestion in Other Suggestions
      const firstSuggestion = removeTopSuggestion(
        sortedSuggestions,
        suggestionAboveThreshold.taxon.id
      )[0];
      return {
        ...newSuggestions,
        topSuggestion: firstSuggestion,
        topSuggestionType: "above-threshold"
      };
    }
    if ( onlineSuggestions?.common_ancestor ) {
      return {
        ...newSuggestions,
        topSuggestion: onlineSuggestions?.common_ancestor,
        topSuggestionType: "common-ancestor"
      };
    }

    return {
      ...newSuggestions,
      topSuggestionType: "none"
    };
  }, [
    onlineSuggestions?.common_ancestor,
    suggestions,
    unfilteredSuggestions,
    hasOfflineSuggestions
  ] );

  const allSuggestionsFetched = suggestions.isLoading
    && (
      ( !tryOfflineSuggestions && fetchStatus === "idle" )
      || !loadingOfflineSuggestions
    );

  const isEmptyList = !topSuggestion && otherSuggestions?.length === 0;

  const updateSuggestions = useCallback( ( ) => {
    if ( !isEmptyList ) { return; }
    setSuggestions( filterSuggestions( ) );
  }, [filterSuggestions, isEmptyList] );

  useEffect( ( ) => {
    // update suggestions when API call and/or offline suggestions are finished loading
    if ( allSuggestionsFetched ) {
      updateSuggestions( );
    }
  }, [allSuggestionsFetched, updateSuggestions] );

  const skipReload = suggestions.usingOfflineSuggestions && !isOnline;

  const reloadSuggestions = useCallback( ( { showLocation } ) => {
    if ( skipReload ) { return; }
    setSuggestions( {
      ...initialSuggestions,
      showSuggestionsWithLocation: showLocation
    } );
    refetchSuggestions( );
  }, [refetchSuggestions, skipReload] );

  return (
    <>
      <Suggestions
        debugData={debugData}
        onPressPhoto={onPressPhoto}
        onTaxonChosen={setSelectedTaxon}
        photoUris={photoUris}
        reloadSuggestions={reloadSuggestions}
        selectedPhotoUri={selectedPhotoUri}
        improveWithLocationButtonOnPress={improveWithLocationButtonOnPress}
        showImproveWithLocationButton={showImproveWithLocationButton}
        suggestions={suggestions}
      />
      <MediaViewerModal
        showModal={mediaViewerVisible}
        onClose={() => setMediaViewerVisible( false )}
        uri={selectedPhotoUri}
        photos={innerPhotos}
      />
      {renderPermissionsGate()}
    </>
  );
};

export default SuggestionsContainer;
