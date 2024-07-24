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
  topSuggestionType: "none"
};

const initialState = {
  flattenedUploadParams: null,
  isLoading: true,
  mediaViewerVisible: false,
  queryKey: [],
  selectedPhotoUri: null,
  selectedTaxon: null,
  shouldUseEvidenceLocation: false,
  showPermissionGate: false
};

const reducer = ( state, action ) => {
  switch ( action.type ) {
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.isLoading
      };
    case "FETCH_ONLINE_SUGGESTIONS":
      return {
        ...state,
        isLoading: true,
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
    showPermissionGate
  } = state;

  const shouldFetchOnlineSuggestions = !!isOnline
    && ( hasPermissions !== undefined )
    && isLoading;

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
    loadingOfflineSuggestions,
    offlineSuggestions
  } = useOfflineSuggestions( selectedPhotoUri, {
    tryOfflineSuggestions
  } );

  const usingOfflineSuggestions = tryOfflineSuggestions || offlineSuggestions.length > 0;

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

  const unfilteredSuggestions = onlineSuggestions?.results?.length > 0
    ? onlineSuggestions.results
    : offlineSuggestions;

  const filterSuggestions = useCallback( ( ) => {
    const removeTopSuggestion = ( list, id ) => _.remove( list, item => item.taxon.id === id );
    const sortedSuggestions = sortSuggestions( unfilteredSuggestions, { usingOfflineSuggestions } );
    const newSuggestions = {
      ...initialSuggestions,
      otherSuggestions: sortedSuggestions
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
    if ( usingOfflineSuggestions || sortedSuggestions.length === 1 ) {
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
    unfilteredSuggestions,
    usingOfflineSuggestions
  ] );

  const suggestions = useMemo( ( ) => {
    // since we can calculate this, there's no need to store it in state
    if ( unfilteredSuggestions?.length > 0 ) {
      return filterSuggestions( );
    }
    return initialSuggestions;
  }, [unfilteredSuggestions?.length, filterSuggestions] );

  useEffect( ( ) => {
    if ( isLoading
      && ( !_.isEqual( initialSuggestions, suggestions )
      || ( !loadingOfflineSuggestions && tryOfflineSuggestions ) ) ) {
      dispatch( {
        type: "SET_LOADING",
        isLoading: false
      } );
    }
  }, [
    isLoading,
    loadingOfflineSuggestions,
    suggestions,
    tryOfflineSuggestions
  ] );

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
    if ( !isOnline ) { return; }
    resetTimeout( );
    dispatch( { type: "FETCH_ONLINE_SUGGESTIONS" } );
  }, [isOnline, resetTimeout] );

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

  const debugData = {
    timedOut,
    onlineSuggestions,
    offlineSuggestions,
    onlineSuggestionsError,
    onlineSuggestionsUpdatedAt,
    selectedPhotoUri,
    shouldUseEvidenceLocation,
    topSuggestionType: suggestions?.topSuggestionType,
    usingOfflineSuggestions
  };

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
        usingOfflineSuggestions={usingOfflineSuggestions}
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
      {/* 20240723 amanda - this feels a bit hacky, but without this extra
      showPermissionGate boolean, renderPermissionsGate creates a maximum update
      exceeded error and keeps returning onPermissionsGranted infinitely */}
      {showPermissionGate && renderPermissionsGate( { onPermissionGranted } )}
    </>
  );
};

export default SuggestionsContainer;
