import {
  useNetInfo
} from "@react-native-community/netinfo";
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
  useLastScreen,
  useLocationPermission
} from "sharedHooks";
import useStore from "stores/useStore";

import fetchCoarseUserLocation from "../../sharedHelpers/fetchUserLocation";
import flattenUploadParams from "./helpers/flattenUploadParams";
import isolateHumans, { humanFilter } from "./helpers/isolateHumans";
import sortSuggestions from "./helpers/sortSuggestions";
import useClearComputerVisionDirectory from "./hooks/useClearComputerVisionDirectory";
import useNavigateWithTaxonSelected from "./hooks/useNavigateWithTaxonSelected";
import useOfflineSuggestions from "./hooks/useOfflineSuggestions";
import useOnlineSuggestions from "./hooks/useOnlineSuggestions";
import Suggestions from "./Suggestions";
import TaxonSearchButton from "./TaxonSearchButton";

const ONLINE_THRESHOLD = 78;
// note: offline threshold may need to change based on input from the CV team
const OFFLINE_THRESHOLD = 0.78;

const setQueryKey = ( selectedPhotoUri, shouldUseEvidenceLocation ) => [
  "scoreImage",
  selectedPhotoUri,
  { shouldUseEvidenceLocation }
];

export type Suggestion = {
  score: number;
  combined_score: number;
  taxon: {
    id: number;
    name: string;
  }
};

export type Suggestions = {
  otherSuggestions: Suggestion[];
  topSuggestion: Suggestion | null;
  topSuggestionType: "none"
    | "human"
    | "above-online-threshold"
    | "above-offline-threshold"
    | "common-ancestor"
    | "not-confident";
};

const initialSuggestions: Suggestions = {
  otherSuggestions: [],
  topSuggestion: null,
  topSuggestionType: "none"
};

const initialState = {
  // loading, online-fetched, online-error, offline-fetched, offline-error
  fetchStatus: "loading",
  flattenedUploadParams: null,
  mediaViewerVisible: false,
  queryKey: [],
  selectedPhotoUri: null,
  selectedTaxon: null,
  shouldUseEvidenceLocation: false
};

const reducer = ( state, action ) => {
  switch ( action.type ) {
    case "FLATTEN_UPLOAD_PARAMS":
      return {
        ...state,
        flattenedUploadParams: action.flattenedUploadParams,
        queryKey: setQueryKey( state.selectedPhotoUri, state.shouldUseEvidenceLocation )
      };
    case "SELECT_PHOTO":
      return {
        ...state,
        fetchStatus: "loading",
        selectedPhotoUri: action.selectedPhotoUri,
        flattenedUploadParams: action.flattenedUploadParams,
        queryKey: setQueryKey( action.selectedPhotoUri, state.shouldUseEvidenceLocation )
      };
    case "SELECT_TAXON":
      return {
        ...state,
        selectedTaxon: action.selectedTaxon
      };
    case "SET_FETCH_STATUS":
      return {
        ...state,
        fetchStatus: action.fetchStatus
      };
    case "TOGGLE_LOCATION":
      return {
        ...state,
        fetchStatus: "loading",
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
  const { isConnected } = useNetInfo( );
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
    && isConnected
    && lastScreen === "Camera", [
    hasPermissions,
    isConnected,
    lastScreen
  ] );
  const improveWithLocationButtonOnPress = useCallback( ( ) => {
    requestPermissions( );
  }, [requestPermissions] );

  const {
    flattenedUploadParams,
    fetchStatus,
    mediaViewerVisible,
    queryKey,
    selectedPhotoUri,
    selectedTaxon,
    shouldUseEvidenceLocation
  } = state;

  const shouldFetchOnlineSuggestions = ( hasPermissions !== undefined )
    && fetchStatus === "loading";

  const {
    dataUpdatedAt: onlineSuggestionsUpdatedAt,
    error: onlineSuggestionsError,
    onlineSuggestions,
    timedOut,
    resetTimeout
  } = useOnlineSuggestions( {
    dispatch,
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

  // 20240815 amanda - it's conceivable that we would want to use a cached image here eventually,
  // since the user can see the small square version of this image in MyObs/ObsDetails already
  // but for now, passing in an https photo to predictImage while offline crashes the app
  const urlWillCrashOffline = selectedPhotoUri.includes( "https://" ) && !isConnected;

  // skip to offline suggestions if internet connection is spotty
  const tryOfflineSuggestions = !urlWillCrashOffline && (
    timedOut
    || (
      ( !onlineSuggestions || onlineSuggestions?.results?.length === 0 )
      && ( fetchStatus === "online-fetched" || fetchStatus === "online-error" ) )
  );

  const {
    offlineSuggestions
  } = useOfflineSuggestions( selectedPhotoUri, {
    dispatch,
    tryOfflineSuggestions
  } );

  const usingOfflineSuggestions = tryOfflineSuggestions || (
    offlineSuggestions.length > 0
      && ( !onlineSuggestions || onlineSuggestions?.results?.length === 0 )
  );

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

  const isLoading = fetchStatus === "loading";

  const filterSuggestions = useCallback( ( suggestionsToFilter: Suggestion[] ) => {
    const sortedSuggestions = sortSuggestions(
      isolateHumans( suggestionsToFilter ),
      { usingOfflineSuggestions }
    );
    const newSuggestions = {
      ...initialSuggestions,
      otherSuggestions: sortedSuggestions
    };
    // no suggestions
    if ( sortedSuggestions.length === 0 ) {
      return {
        ...newSuggestions,
        otherSuggestions: [],
        topSuggestionType: "none"
      };
    }
    // human top suggestion
    if ( sortedSuggestions.find( humanFilter ) ) {
      return {
        ...newSuggestions,
        topSuggestion: sortedSuggestions[0],
        topSuggestionType: "human",
        otherSuggestions: []
      };
    }

    // Note: score_vision responses have combined_score values between 0 and
    // 100, compared with offline model results that have scores between 0
    // and 1
    const filterCriteria = usingOfflineSuggestions
      ? s => s.score > OFFLINE_THRESHOLD
      : s => s.combined_score > ONLINE_THRESHOLD;

    const suggestionAboveThreshold = _.find(
      sortedSuggestions,
      filterCriteria
    );

    if ( suggestionAboveThreshold ) {
      // make sure we're not returning the top suggestion in Other Suggestions
      const firstSuggestion = _.remove(
        sortedSuggestions,
        ( s: Suggestion ) => s.taxon.id === suggestionAboveThreshold.taxon.id
      ).at( 0 );
      return {
        ...newSuggestions,
        topSuggestion: firstSuggestion,
        topSuggestionType: usingOfflineSuggestions
          ? "above-offline-threshold"
          : "above-online-threshold"
      };
    }
    if ( !suggestionAboveThreshold && usingOfflineSuggestions ) {
      // no top suggestion for offline
      return {
        ...newSuggestions,
        topSuggestion: null,
        topSuggestionType: "not-confident"
      };
    }

    // online common ancestor
    if ( onlineSuggestions?.common_ancestor ) {
      return {
        ...newSuggestions,
        topSuggestion: onlineSuggestions?.common_ancestor,
        topSuggestionType: "common-ancestor"
      };
    }

    // no top suggestion
    return {
      ...newSuggestions,
      topSuggestionType: "not-confident"
    };
  }, [
    onlineSuggestions?.common_ancestor,
    usingOfflineSuggestions
  ] );

  // since we can calculate this, there's no need to store it in state
  const suggestions = useMemo(
    ( ) => filterSuggestions( unfilteredSuggestions ),
    [unfilteredSuggestions, filterSuggestions]
  );

  const toggleLocation = useCallback( async ( { showLocation } ) => {
    const newImageParams = await createUploadParams( selectedPhotoUri, showLocation );
    resetTimeout( );
    dispatch( {
      type: "TOGGLE_LOCATION",
      shouldUseEvidenceLocation: showLocation,
      flattenedUploadParams: newImageParams
    } );
  }, [
    createUploadParams,
    resetTimeout,
    selectedPhotoUri
  ] );

  const reloadSuggestions = useCallback( ( ) => {
    // used when offline text is tapped to try to get online
    // suggestions
    if ( !isConnected ) { return; }
    resetTimeout( );
    dispatch( { type: "SET_FETCH_STATUS", fetchStatus: "loading" } );
  }, [isConnected, resetTimeout] );

  const hideLocationToggleButton = usingOfflineSuggestions
    || isLoading
    || showImproveWithLocationButton
    || !isConnected;

  const setImageParams = useCallback( async ( ) => {
    if ( isConnected === false ) {
      return;
    }
    const newImageParams = await createUploadParams( selectedPhotoUri, shouldUseEvidenceLocation );
    dispatch( { type: "FLATTEN_UPLOAD_PARAMS", flattenedUploadParams: newImageParams } );
  }, [
    createUploadParams,
    isConnected,
    selectedPhotoUri,
    shouldUseEvidenceLocation
  ] );

  const headerRight = useCallback( ( ) => <TaxonSearchButton />, [] );

  useEffect( ( ) => {
    const onFocus = navigation.addListener( "focus", ( ) => {
      // resizeImage crashes if trying to resize an https:// photo while there is no internet
      // in this situation, we can skip creating upload parameters since we're loading
      // offline suggestions anyway
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
    const userLocation = await fetchCoarseUserLocation( );
    updateObservationKeys( userLocation );
    const newImageParams = await flattenUploadParams( selectedPhotoUri );
    newImageParams.lat = userLocation?.latitude;
    newImageParams.lng = userLocation?.longitude;
    dispatch( {
      type: "TOGGLE_LOCATION",
      shouldUseEvidenceLocation: true,
      flattenedUploadParams: newImageParams
    } );
  }, [selectedPhotoUri, updateObservationKeys] );

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
        urlWillCrashOffline={urlWillCrashOffline}
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
      {renderPermissionsGate( { onPermissionGranted } )}
    </>
  );
};

export default SuggestionsContainer;
