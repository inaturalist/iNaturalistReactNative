import { useNavigation, useRoute } from "@react-navigation/native";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import _ from "lodash";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer
} from "react";
import ObservationPhoto from "realmModels/ObservationPhoto";
import {
  useIsConnected,
  useLastScreen,
  useLocationPermission
  // useWatchPosition
} from "sharedHooks";
// import { log } from "sharedHelpers/logger";
import useStore from "stores/useStore";

import fetchUserLocation from "../../sharedHelpers/fetchUserLocation";
import flattenUploadParams from "./helpers/flattenUploadParams";
import sortSuggestions from "./helpers/sortSuggestions";
import useClearComputerVisionDirectory from "./hooks/useClearComputerVisionDirectory";
import useNavigateWithTaxonSelected from "./hooks/useNavigateWithTaxonSelected";
import useOfflineSuggestions from "./hooks/useOfflineSuggestions";
import useOnlineSuggestions from "./hooks/useOnlineSuggestions";
import Suggestions from "./Suggestions";
import TaxonSearchButton from "./TaxonSearchButton";
// const logger = log.extend( "SuggestionsContainer" );

const setQueryKey = ( selectedPhotoUri, shouldUseEvidenceLocation ) => [
  "scoreImage",
  selectedPhotoUri,
  { shouldUseEvidenceLocation }
];

const initialSuggestions = {
  otherSuggestions: [],
  topSuggestion: null,
  topSuggestionType: "none",
  usingOfflineSuggestions: false
};

const initialState = {
  flattenedUploadParams: null,
  isLoading: true,
  mediaViewerVisible: false,
  queryKey: [],
  selectedPhotoUri: null,
  selectedTaxon: null,
  shouldUseEvidenceLocation: false,
  showPermissionGate: false,
  suggestions: initialSuggestions
};

const reducer = ( state, action ) => {
  console.log( action.type, "action type" );
  switch ( action.type ) {
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
        suggestions: initialSuggestions,
        queryKey: setQueryKey( state.selectedPhotoUri, state.shouldUseEvidenceLocation )
      };
    case "FLATTEN_UPLOAD_PARAMS":
      return {
        ...state,
        flattenedUploadParams: action.flattenedUploadParams
      };
    case "SELECT_PHOTO":
      return {
        ...state,
        selectedPhotoUri: action.selectedPhotoUri,
        flattenedUploadParams: action.flattenedUploadParams,
        isLoading: true,
        suggestions: initialSuggestions,
        queryKey: setQueryKey( action.selectedPhotoUri, state.shouldUseEvidenceLocation )
      };
    case "SELECT_TAXON":
      return {
        ...state,
        selectedTaxon: action.selectedTaxon
      };
    case "SHOW_PERMISSION_GATE":
      return {
        ...state,
        showPermissionGate: action.showPermissionGate
      };
    case "TOGGLE_LOCATION":
      return {
        ...state,
        isLoading: true,
        flattenedUploadParams: action.flattenedUploadParams,
        shouldUseEvidenceLocation: action.shouldUseEvidenceLocation,
        queryKey: setQueryKey( state.selectedPhotoUri, action.shouldUseEvidenceLocation )
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
  const navigation = useNavigation( );
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

  const [state, dispatch] = useReducer( reducer, {
    ...initialState,
    selectedPhotoUri: photoUris[0],
    shouldUseEvidenceLocation: evidenceHasLocation
  } );

  const {
    hasPermissions,
    renderPermissionsGate,
    requestPermissions
  } = useLocationPermission( );
  const lastScreen = useLastScreen( );
  const showImproveWithLocationButton = useMemo( ( ) => hasPermissions === false
    && isOnline
    && lastScreen === "Camera", [
    hasPermissions,
    isOnline,
    lastScreen
  ] );
  const improveWithLocationButtonOnPress = useCallback( ( ) => {
    dispatch( { type: "SHOW_PERMISSION_GATE", showPermissionGate: true } );
    requestPermissions( );
  }, [requestPermissions] );

  const {
    flattenedUploadParams,
    isLoading,
    mediaViewerVisible,
    queryKey,
    selectedPhotoUri,
    selectedTaxon,
    shouldUseEvidenceLocation,
    showPermissionGate,
    suggestions
  } = state;

  const shouldFetchOnlineSuggestions = !!isOnline
    && ( hasPermissions !== undefined )
    && isLoading;

  const {
    usingOfflineSuggestions
  } = suggestions;

  const {
    dataUpdatedAt: onlineSuggestionsUpdatedAt,
    error: onlineSuggestionsError,
    onlineSuggestions,
    timedOut,
    resetTimeout
  } = useOnlineSuggestions( {
    flattenedUploadParams,
    queryKey,
    shouldFetchOnlineSuggestions
  } );

  const createUploadParams = useCallback( async ( uri, showLocation ) => {
    const newImageParams = await flattenUploadParams( uri );
    if ( showLocation && currentObservation?.latitude ) {
      newImageParams.lat = currentObservation?.latitude;
      newImageParams.lng = currentObservation?.longitude;
    }
    return newImageParams;
  }, [
    currentObservation
  ] );

  // skip to offline suggestions if internet connection is spotty
  const tryOfflineSuggestions = onlineSuggestions?.results?.length === 0
    || timedOut;

  const {
    offlineSuggestions
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
    async uri => {
      if ( uri === selectedPhotoUri ) {
        dispatch( {
          type: "TOGGLE_MEDIA_VIEWER",
          mediaViewerVisible: true
        } );
      } else {
        const newImageParams = await createUploadParams( uri, shouldUseEvidenceLocation );
        dispatch( {
          type: "SELECT_PHOTO",
          selectedPhotoUri: uri,
          flattenedUploadParams: newImageParams
        } );
      }
    },
    [
      createUploadParams,
      selectedPhotoUri,
      shouldUseEvidenceLocation
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
    if ( unfilteredSuggestions.length > 0 ) {
      updateSuggestions( );
    }
  }, [unfilteredSuggestions, updateSuggestions] );

  const skipReload = suggestions.usingOfflineSuggestions && !isOnline;

  const toggleLocation = useCallback( async ( { showLocation } ) => {
    const newImageParams = await createUploadParams( selectedPhotoUri, showLocation );
    dispatch( {
      type: "TOGGLE_LOCATION",
      shouldUseEvidenceLocation: showLocation,
      flattenedUploadParams: newImageParams
    } );
    resetTimeout( );
    dispatch( { type: "FETCH_ONLINE_SUGGESTIONS" } );
  }, [
    createUploadParams,
    resetTimeout,
    selectedPhotoUri
  ] );

  const reloadSuggestions = useCallback( ( ) => {
    // used when offline text is tapped to try to get online
    // suggestions
    if ( skipReload ) { return; }
    resetTimeout( );
    dispatch( { type: "FETCH_ONLINE_SUGGESTIONS" } );
  }, [skipReload, resetTimeout] );

  const hideLocationToggleButton = usingOfflineSuggestions
    || isLoading
    || showImproveWithLocationButton
    || !isOnline;

  const setImageParams = useCallback( async ( ) => {
    const newImageParams = await createUploadParams( selectedPhotoUri, shouldUseEvidenceLocation );
    dispatch( { type: "FLATTEN_UPLOAD_PARAMS", flattenedUploadParams: newImageParams } );
    dispatch( { type: "FETCH_ONLINE_SUGGESTIONS" } );
  }, [
    createUploadParams,
    selectedPhotoUri,
    shouldUseEvidenceLocation
  ] );

  const headerRight = useCallback( ( ) => <TaxonSearchButton />, [] );

  useEffect( ( ) => {
    const onFocus = navigation.addListener( "focus", ( ) => {
      if ( _.isEqual( initialSuggestions, suggestions ) ) {
        setImageParams( );
      }
      navigation.setOptions( { headerRight } );
    } );
    return onFocus;
  }, [
    headerRight,
    navigation,
    setImageParams,
    suggestions
  ] );

  const onPermissionGranted = useCallback( async ( ) => {
    dispatch( { type: "SHOW_PERMISSION_GATE", showPermissionGate: false } );
    const userLocation = await fetchUserLocation( );
    updateObservationKeys( userLocation );
    toggleLocation( { showLocation: true } );
  }, [toggleLocation, updateObservationKeys] );

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
      {/* 20240723 amanda - this feels kind of hacky, but without this extra
      showPermissionGate boolean, renderPermissionsGate creates a maximum update
      exceeded error and keeps returning onPermissionsGranted infinitely */}
      {showPermissionGate && renderPermissionsGate( { onPermissionGranted } )}
    </>
  );
};

export default SuggestionsContainer;
