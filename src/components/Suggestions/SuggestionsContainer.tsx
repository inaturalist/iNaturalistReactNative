import {
  useNetInfo,
} from "@react-native-community/netinfo";
import { useNavigation, useRoute } from "@react-navigation/native";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import isEqual from "lodash/isEqual";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import ObservationPhoto from "realmModels/ObservationPhoto";
import { log } from "sharedHelpers/logger";
import {
  useLastScreen,
  useLocationPermission,
  usePerformance,
  useSuggestions,
} from "sharedHooks";
import { isDebugMode } from "sharedHooks/useDebugMode";
import {
  internalUseSuggestionsInitialSuggestions,
} from "sharedHooks/useSuggestions/filterSuggestions";
import type { TopSuggestionType } from "sharedHooks/useSuggestions/types";
import useStore from "stores/useStore";

import fetchCoarseUserLocation from "../../sharedHelpers/fetchCoarseUserLocation";
import flattenUploadParams from "./helpers/flattenUploadParams";
import useClearComputerVisionDirectory from "./hooks/useClearComputerVisionDirectory";
import useNavigateWithTaxonSelected from "./hooks/useNavigateWithTaxonSelected";
import Suggestions from "./Suggestions";
import TaxonSearchButton from "./TaxonSearchButton";

const logger = log.extend( "SuggestionsContainer" );

export enum FETCH_STATUSES {
  FETCH_STATUS_LOADING = "loading",
  FETCH_STATUS_ONLINE_FETCHED = "online-fetched",
  FETCH_STATUS_ONLINE_ERROR = "online-error",
  FETCH_STATUS_OFFLINE_FETCHED = "offline-fetched",
  FETCH_STATUS_OFFLINE_ERROR = "offline-error",
  FETCH_STATUS_OFFLINE_SKIPPED = "offline-skipped",
  FETCH_STATUS_ONLINE_SKIPPED = "online-skipped"
}

const getQueryKey = ( selectedPhotoUri: string, shouldUseEvidenceLocation: boolean ) => [
  "scoreImage",
  selectedPhotoUri,
  { shouldUseEvidenceLocation },
];

export interface Suggestion {
  combined_score: number;
  taxon: {
    id: number;
    name: string;
  };
}

export interface Suggestions {
  otherSuggestions: Suggestion[];
  topSuggestion: Suggestion | null;
  topSuggestionType: TopSuggestionType;
}

const initialState = {
  onlineFetchStatus: FETCH_STATUSES.FETCH_STATUS_LOADING,
  offlineFetchStatus: FETCH_STATUSES.FETCH_STATUS_LOADING,
  scoreImageParams: null,
  mediaViewerVisible: false,
  queryKey: [],
  selectedPhotoUri: null,
  selectedTaxon: null,
  shouldUseEvidenceLocation: false,
};

const reducer = ( state, action ) => {
  switch ( action.type ) {
    case "SET_UPLOAD_PARAMS":
      return {
        ...state,
        scoreImageParams: action.scoreImageParams,
        queryKey: getQueryKey( state.selectedPhotoUri, state.shouldUseEvidenceLocation ),
      };
    case "SELECT_PHOTO":
      return {
        ...state,
        onlineFetchStatus: FETCH_STATUSES.FETCH_STATUS_LOADING,
        offlineFetchStatus: FETCH_STATUSES.FETCH_STATUS_LOADING,
        selectedPhotoUri: action.selectedPhotoUri,
        scoreImageParams: action.scoreImageParams,
        queryKey: getQueryKey( action.selectedPhotoUri, state.shouldUseEvidenceLocation ),
      };
    case "SELECT_TAXON":
      return {
        ...state,
        selectedTaxon: action.selectedTaxon,
      };
    case "SET_ONLINE_FETCH_STATUS":
      return {
        ...state,
        onlineFetchStatus: action.onlineFetchStatus,
      };
    case "SET_OFFLINE_FETCH_STATUS":
      return {
        ...state,
        offlineFetchStatus: action.offlineFetchStatus,
      };
    case "TOGGLE_LOCATION":
      return {
        ...state,
        onlineFetchStatus: FETCH_STATUSES.FETCH_STATUS_LOADING,
        offlineFetchStatus: FETCH_STATUSES.FETCH_STATUS_LOADING,
        scoreImageParams: action.scoreImageParams,
        shouldUseEvidenceLocation: action.shouldUseEvidenceLocation,
        queryKey: getQueryKey( state.selectedPhotoUri, action.shouldUseEvidenceLocation ),
      };
    case "TOGGLE_MEDIA_VIEWER":
      return {
        ...state,
        mediaViewerVisible: action.mediaViewerVisible,
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
  // ObservationPhoto.mapObsPhotoUris returns *new* strings with every call,
  // so these values need to be stabilized
  const photoUris = useMemo(
    ( ) => ObservationPhoto.mapObsPhotoUris( currentObservation ),
    [currentObservation],
  );
  const updateObservationKeys = useStore( state => state.updateObservationKeys );

  const evidenceHasLocation = !!currentObservation?.latitude;

  const [state, dispatch] = useReducer( reducer, {
    ...initialState,
    selectedPhotoUri: photoUris[0],
    shouldUseEvidenceLocation: evidenceHasLocation,
  } );

  const {
    hasPermissions,
    renderPermissionsGate,
    requestPermissions,
  } = useLocationPermission( );
  const lastScreen = useLastScreen( );
  const showImproveWithLocationButton = useMemo( ( ) => hasPermissions === false
    && isConnected
    && lastScreen === "Camera", [
    hasPermissions,
    isConnected,
    lastScreen,
  ] );
  const improveWithLocationButtonOnPress = useCallback( ( ) => {
    requestPermissions( );
  }, [requestPermissions] );

  const {
    scoreImageParams,
    onlineFetchStatus,
    offlineFetchStatus,
    mediaViewerVisible,
    queryKey,
    selectedPhotoUri,
    selectedTaxon,
    shouldUseEvidenceLocation,
  } = state;

  const shouldFetchOnlineSuggestions = ( hasPermissions !== undefined )
      && onlineFetchStatus === FETCH_STATUSES.FETCH_STATUS_LOADING;

  const onlineSuggestionsAttempted
   = onlineFetchStatus === FETCH_STATUSES.FETCH_STATUS_ONLINE_FETCHED
      || onlineFetchStatus === FETCH_STATUSES.FETCH_STATUS_ONLINE_ERROR;

  const onFetchError = useCallback(
    ( { isOnline }: { isOnline: boolean } ) => {
      if ( isOnline ) {
        dispatch( {
          type: "SET_ONLINE_FETCH_STATUS",
          onlineFetchStatus: FETCH_STATUSES.FETCH_STATUS_ONLINE_ERROR,
        } );
      } else {
        dispatch( {
          type: "SET_OFFLINE_FETCH_STATUS",
          offlineFetchStatus: FETCH_STATUSES.FETCH_STATUS_OFFLINE_ERROR,
        } );
        // If offline is finished, and online still in loading state it means it never started
        if ( onlineFetchStatus === FETCH_STATUSES.FETCH_STATUS_LOADING ) {
          dispatch( {
            type: "SET_ONLINE_FETCH_STATUS",
            onlineFetchStatus: FETCH_STATUSES.FETCH_STATUS_ONLINE_SKIPPED,
          } );
        }
      }
    },
    [onlineFetchStatus],
  );

  const onFetched = useCallback(
    ( { isOnline }: { isOnline: boolean } ) => {
      if ( isOnline ) {
        dispatch( {
          type: "SET_ONLINE_FETCH_STATUS",
          onlineFetchStatus: FETCH_STATUSES.FETCH_STATUS_ONLINE_FETCHED,
        } );
        // Currently we start offline only when online has an error, so
        // we can register offline as skipped if online is successful
        dispatch( {
          type: "SET_OFFLINE_FETCH_STATUS",
          offlineFetchStatus: FETCH_STATUSES.FETCH_STATUS_OFFLINE_SKIPPED,
        } );
      } else {
        dispatch( {
          type: "SET_OFFLINE_FETCH_STATUS",
          offlineFetchStatus: FETCH_STATUSES.FETCH_STATUS_OFFLINE_FETCHED,
        } );
        // If offline is finished, and online still in loading state it means it never started
        if ( onlineFetchStatus === FETCH_STATUSES.FETCH_STATUS_LOADING ) {
          dispatch( {
            type: "SET_ONLINE_FETCH_STATUS",
            onlineFetchStatus: FETCH_STATUSES.FETCH_STATUS_ONLINE_SKIPPED,
          } );
        }
      }
    },
    [onlineFetchStatus],
  );

  const {
    timedOut,
    resetTimeout,
    onlineSuggestions,
    onlineSuggestionsError,
    onlineSuggestionsUpdatedAt,
    suggestions,
    usingOfflineSuggestions,
    urlWillCrashOffline,
  } = useSuggestions( selectedPhotoUri, {
    shouldFetchOnlineSuggestions,
    onFetchError,
    onFetched,
    scoreImageParams,
    queryKey,
    onlineSuggestionsAttempted,
  } );

  const createUploadParams = useCallback( async ( uri: string, showLocation: boolean ) => {
    const newImageParams = await flattenUploadParams( uri );
    if ( showLocation && currentObservation?.latitude ) {
      newImageParams.lat = currentObservation?.latitude;
      newImageParams.lng = currentObservation?.longitude;
    }
    return newImageParams;
  }, [
    currentObservation,
  ] );

  const setSelectedTaxon = taxon => {
    dispatch( {
      type: "SELECT_TAXON",
      selectedTaxon: taxon,
    } );
  };

  useNavigateWithTaxonSelected(
    selectedTaxon,
    ( ) => setSelectedTaxon( null ),
    { vision: true },
  );

  const onPressPhoto = useCallback(
    async ( uri: string ) => {
      if ( uri === selectedPhotoUri ) {
        dispatch( {
          type: "TOGGLE_MEDIA_VIEWER",
          mediaViewerVisible: true,
        } );
      } else {
        const newImageParams = await createUploadParams( uri, shouldUseEvidenceLocation );
        dispatch( {
          type: "SELECT_PHOTO",
          selectedPhotoUri: uri,
          scoreImageParams: newImageParams,
        } );
      }
    },
    [
      createUploadParams,
      selectedPhotoUri,
      shouldUseEvidenceLocation,
    ],
  );

  const isLoading = onlineFetchStatus === FETCH_STATUSES.FETCH_STATUS_LOADING
    || offlineFetchStatus === FETCH_STATUSES.FETCH_STATUS_LOADING;

  const { loadTime } = usePerformance( {
    isLoading,
  } );
  if ( isDebugMode( ) && loadTime ) {
    logger.info( loadTime );
  }

  const toggleLocation = useCallback( async ( { showLocation }: { showLocation: boolean } ) => {
    const newImageParams = await createUploadParams( selectedPhotoUri, showLocation );
    resetTimeout( );
    dispatch( {
      type: "TOGGLE_LOCATION",
      shouldUseEvidenceLocation: showLocation,
      scoreImageParams: newImageParams,
    } );
  }, [
    createUploadParams,
    resetTimeout,
    selectedPhotoUri,
  ] );

  const reloadSuggestions = useCallback( ( ) => {
    // used when offline text is tapped to try to get online
    // suggestions
    if ( !isConnected ) { return; }
    resetTimeout( );
    dispatch(
      {
        type: "SET_ONLINE_FETCH_STATUS",
        onlineFetchStatus: FETCH_STATUSES.FETCH_STATUS_LOADING,
      },
    );
    dispatch(
      {
        type: "SET_OFFLINE_FETCH_STATUS",
        offlineFetchStatus: FETCH_STATUSES.FETCH_STATUS_LOADING,
      },
    );
  }, [isConnected, resetTimeout] );

  const hideLocationToggleButton = usingOfflineSuggestions
    || isLoading
    || showImproveWithLocationButton
    || !isConnected
    || !evidenceHasLocation;

  const setImageParams = useCallback( async ( ) => {
    if ( isConnected === false ) {
      return;
    }
    const newImageParams = await createUploadParams( selectedPhotoUri, shouldUseEvidenceLocation );
    dispatch( { type: "SET_UPLOAD_PARAMS", scoreImageParams: newImageParams } );
  }, [
    createUploadParams,
    isConnected,
    selectedPhotoUri,
    shouldUseEvidenceLocation,
  ] );

  const headerRight = useCallback( ( ) => <TaxonSearchButton />, [] );

  const shouldSetImageParams = useMemo(
    // TODO: part of MOB-1081, see `internalUseSuggestionsInitialSuggestions`
    // we shouldn't rely on implementation internals to consumer drive state
    () => isEqual( internalUseSuggestionsInitialSuggestions, suggestions ),
    [suggestions],
  );

  useEffect( ( ) => {
    const unsubscribe = navigation.addListener( "focus", ( ) => {
      // resizeImage crashes if trying to resize an https:// photo while there is no internet
      // in this situation, we can skip creating upload parameters since we're loading
      // offline suggestions anyway
      if ( shouldSetImageParams ) {
        setImageParams();
      }
      navigation.setOptions( { headerRight } );
    } );
    return unsubscribe;
  }, [navigation, setImageParams, shouldSetImageParams, headerRight] );

  const onPermissionGranted = useCallback( async ( ) => {
    const userLocation = await fetchCoarseUserLocation( );
    updateObservationKeys( userLocation );
    const newImageParams = await flattenUploadParams( selectedPhotoUri );
    newImageParams.lat = userLocation?.latitude;
    newImageParams.lng = userLocation?.longitude;
    dispatch( {
      type: "TOGGLE_LOCATION",
      shouldUseEvidenceLocation: true,
      scoreImageParams: newImageParams,
    } );
  }, [selectedPhotoUri, updateObservationKeys] );

  const debugData = {
    timedOut,
    onlineFetchStatus,
    onlineSuggestions,
    onlineSuggestionsError,
    onlineSuggestionsUpdatedAt,
    selectedPhotoUri,
    shouldUseEvidenceLocation,
    topSuggestionType: suggestions?.topSuggestionType,
    offlineFetchStatus,
    usingOfflineSuggestions,
    suggestions,
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
        showImproveWithLocationButton={!!showImproveWithLocationButton}
        suggestions={suggestions}
        toggleLocation={toggleLocation}
        urlWillCrashOffline={urlWillCrashOffline}
        usingOfflineSuggestions={usingOfflineSuggestions}
      />
      <MediaViewerModal
        showModal={mediaViewerVisible}
        onClose={( ) => dispatch( {
          type: "TOGGLE_MEDIA_VIEWER",
          mediaViewerVisible: false,
        } )}
        uri={selectedPhotoUri}
        photos={innerPhotos}
      />
      {renderPermissionsGate( { onPermissionGranted } )}
    </>
  );
};

export default SuggestionsContainer;
