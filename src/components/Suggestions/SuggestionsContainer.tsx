import { useRoute } from "@react-navigation/native";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import _ from "lodash";
import React, {
  useCallback,
  useEffect,
  useReducer
} from "react";
import ObservationPhoto from "realmModels/ObservationPhoto";
import {
  useIsConnected,
  useLastScreen,
  useLocationPermission,
  useWatchPosition
} from "sharedHooks";
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
  otherSuggestions: [],
  topSuggestion: null,
  topSuggestionType: "none",
  usingOfflineSuggestions: false
};

const initialState = {
  isLoading: true,
  mediaViewerVisible: false,
  selectedPhotoUri: null,
  selectedTaxon: null,
  shouldFetchLocation: false,
  shouldUseEvidenceLocation: false,
  suggestions: initialSuggestions
};

const reducer = ( state, action ) => {
  console.log( action.type, "action in reducer" );
  switch ( action.type ) {
    case "BEGIN_USER_LOCATION_FETCH":
      return {
        ...state,
        shouldFetchLocation: true,
        isLoading: true
      };
    case "DISPLAY_SUGGESTIONS":
      return {
        ...state,
        isLoading: false,
        suggestions: action.suggestions
      };
    case "FETCH_ONLINE_SUGGESTIONS":
      return {
        ...state,
        isLoading: true,
        suggestions: initialSuggestions
      };
    case "SELECT_PHOTO_AND_FETCH":
      return {
        ...state,
        selectedPhotoUri: action.selectedPhotoUri,
        isLoading: true,
        suggestions: initialSuggestions
      };
    case "SELECT_TAXON":
      return {
        ...state,
        selectedTaxon: action.selectedTaxon
      };
    case "TOGGLE_LOCATION":
      return {
        ...state,
        shouldUseEvidenceLocation: action.shouldUseEvidenceLocation
      };
    case "TOGGLE_MEDIA_VIEWER":
      return {
        ...state,
        mediaViewerVisible: action.mediaViewerVisible
      };
    default:
      throw new Error( );
  }
};

const SuggestionsContainer = ( ) => {
  const { params } = useRoute( );
  const isOnline = useIsConnected( );
  // clearing the cache of resized images for the score_image API
  // placing this here means we can keep the app size small
  // and only have the latest resized image stored in computerVisionSuggestions
  useClearComputerVisionDirectory( );
  const currentObservation = useStore( state => state.currentObservation );
  const innerPhotos = ObservationPhoto.mapInnerPhotos( currentObservation );
  const photoUris = ObservationPhoto.mapObsPhotoUris( currentObservation );
  const updateObservationKeys = useStore( state => state.updateObservationKeys );

  const evidenceHasLocation = !!currentObservation?.latitude;
  const { hasPermissions, renderPermissionsGate, requestPermissions } = useLocationPermission( );
  const lastScreen = useLastScreen( );
  const showImproveWithLocationButton = hasPermissions === false
    && isOnline
    && lastScreen === "Camera";
  const improveWithLocationButtonOnPress = useCallback( ( ) => {
    requestPermissions( );
  }, [requestPermissions] );

  const [state, dispatch] = useReducer( reducer, {
    ...initialState,
    selectedPhotoUri: photoUris[0],
    shouldUseEvidenceLocation: evidenceHasLocation
  } );

  const {
    isLoading,
    mediaViewerVisible,
    selectedPhotoUri,
    selectedTaxon,
    shouldFetchLocation,
    suggestions,
    shouldUseEvidenceLocation
  } = state;

  const shouldFetchOnlineSuggestions = !!isOnline
    && ( hasPermissions !== undefined )
    && isLoading;

  const { userLocation } = useWatchPosition( {
    shouldFetchLocation
  } );

  const {
    usingOfflineSuggestions
  } = suggestions;

  const {
    dataUpdatedAt: onlineSuggestionsUpdatedAt,
    error: onlineSuggestionsError,
    onlineSuggestions,
    timedOut,
    removePrevQuery,
    resetImageParams,
    fetchStatus
  } = useOnlineSuggestions( selectedPhotoUri, {
    shouldUseEvidenceLocation,
    shouldFetchOnlineSuggestions
  } );

  console.log(
    onlineSuggestions?.results?.[0]?.taxon?.name,
    "top taxon name",
    selectedPhotoUri?.split( "photoUploads/" )[1]
  );

  const loadingOnlineSuggestions = fetchStatus === "fetching";

  // skip to offline suggestions if internet connection is spotty
  const tryOfflineSuggestions = onlineSuggestions?.results?.length === 0
    && ( timedOut || !loadingOnlineSuggestions );

  const {
    offlineSuggestions,
    loadingOfflineSuggestions
  } = useOfflineSuggestions( selectedPhotoUri, {
    tryOfflineSuggestions
  } );

  const hasOfflineSuggestions = tryOfflineSuggestions && offlineSuggestions?.length > 0;

  const setSelectedTaxon = taxon => {
    dispatch( {
      type: "SELECT_TAXON",
      selectedTaxon: taxon
    } );
  };

  useNavigateWithTaxonSelected(
    selectedTaxon,
    ( ) => setSelectedTaxon( null ),
    { vision: true }
  );

  const onPressPhoto = useCallback(
    uri => {
      if ( uri === selectedPhotoUri ) {
        dispatch( {
          type: "TOGGLE_MEDIA_VIEWER",
          mediaViewerVisible: true
        } );
      } else {
        resetImageParams( );
        dispatch( {
          type: "SELECT_PHOTO_AND_FETCH",
          selectedPhotoUri: uri
        } );
      }
    },
    [
      resetImageParams,
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
    shouldUseEvidenceLocation,
    topSuggestionType: suggestions.topSuggestionType,
    usingOfflineSuggestions: suggestions.usingOfflineSuggestions
  };

  const unfilteredSuggestions = onlineSuggestions?.results?.length > 0
    ? onlineSuggestions.results
    : offlineSuggestions;

  const filterSuggestions = useCallback( ( ) => {
    const removeTopSuggestion = ( list, id ) => _.remove( list, item => item.taxon.id === id );
    const sortedSuggestions = sortSuggestions( unfilteredSuggestions, { hasOfflineSuggestions } );
    const newSuggestions = {
      ...suggestions,
      otherSuggestions: sortedSuggestions,
      usingOfflineSuggestions: hasOfflineSuggestions
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

  const allSuggestionsFetched = onlineSuggestions?.results?.length > 0
    || offlineSuggestions.length > 0
    || ( !tryOfflineSuggestions
        && fetchStatus === "idle"
        && !loadingOfflineSuggestions
    );

  const updateSuggestions = useCallback( ( ) => {
    const filteredSuggestions = filterSuggestions( );
    if ( !_.isEqual( filteredSuggestions, suggestions ) ) {
      dispatch( {
        type: "DISPLAY_SUGGESTIONS",
        suggestions: filteredSuggestions
      } );
    }
  }, [filterSuggestions, suggestions] );

  useEffect( ( ) => {
    // update suggestions when API call and/or offline suggestions are finished loading
    if ( allSuggestionsFetched ) {
      updateSuggestions( );
    }
  }, [allSuggestionsFetched, updateSuggestions] );

  const skipReload = suggestions.usingOfflineSuggestions && !isOnline;

  const toggleLocation = useCallback( ( { showLocation } ) => {
    dispatch( {
      type: "TOGGLE_LOCATION",
      shouldUseEvidenceLocation: showLocation
    } );
    removePrevQuery( );
    dispatch( { type: "FETCH_ONLINE_SUGGESTIONS" } );
  }, [removePrevQuery] );

  const reloadSuggestions = useCallback( ( ) => {
    // used when offline text is tapped to try to get online
    // suggestions
    if ( skipReload ) { return; }
    removePrevQuery( );
    dispatch( { type: "FETCH_ONLINE_SUGGESTIONS" } );
  }, [skipReload, removePrevQuery] );

  const hideLocationToggleButton = usingOfflineSuggestions
    || isLoading
    || showImproveWithLocationButton
    || !isOnline;

  const fetchUserLocation = hasPermissions && !evidenceHasLocation && lastScreen === "Camera";

  useEffect( ( ) => {
    // user grants permissions after Camera screen
    if ( fetchUserLocation ) {
      dispatch( { type: "BEGIN_USER_LOCATION_FETCH" } );
    }
  }, [fetchUserLocation] );

  useEffect( ( ) => {
    dispatch( { type: "FETCH_ONLINE_SUGGESTIONS" } );
  }, [] );

  useEffect( ( ) => {
    if ( userLocation?.latitude ) {
      updateObservationKeys( userLocation );
      dispatch( { type: "FETCH_ONLINE_SUGGESTIONS" } );
    }
  }, [userLocation, updateObservationKeys, toggleLocation] );

  return (
    <>
      <Suggestions
        debugData={debugData}
        handleSkip={( ) => setSelectedTaxon( undefined )}
        hideLocationToggleButton={hideLocationToggleButton}
        hideSkip={params?.hideSkip}
        improveWithLocationButtonOnPress={improveWithLocationButtonOnPress}
        isLoading={isLoading}
        shouldUseEvidenceLocation={shouldUseEvidenceLocation}
        onPressPhoto={onPressPhoto}
        onTaxonChosen={setSelectedTaxon}
        photoUris={photoUris}
        reloadSuggestions={reloadSuggestions}
        selectedPhotoUri={selectedPhotoUri}
        showImproveWithLocationButton={showImproveWithLocationButton}
        suggestions={suggestions}
        toggleLocation={toggleLocation}
      />
      <MediaViewerModal
        showModal={mediaViewerVisible}
        onClose={( ) => dispatch( {
          type: "TOGGLE_MEDIA_VIEWER",
          mediaViewerVisible: false
        } )}
        uri={selectedPhotoUri}
        photos={innerPhotos}
      />
      {renderPermissionsGate()}
    </>
  );
};

export default SuggestionsContainer;
