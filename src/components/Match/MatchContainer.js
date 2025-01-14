import {
  useNetInfo
} from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import flattenUploadParams from "components/Suggestions/helpers/flattenUploadParams.ts";
import {
  FETCH_STATUS_LOADING,
  FETCH_STATUS_OFFLINE_ERROR,
  FETCH_STATUS_OFFLINE_FETCHED,
  FETCH_STATUS_ONLINE_ERROR,
  FETCH_STATUS_ONLINE_FETCHED,
  initialSuggestions
} from "components/Suggestions/SuggestionsContainer.tsx";
import _ from "lodash";
import React, {
  useCallback, useEffect, useReducer, useRef
} from "react";
import { useLocationPermission, useSuggestions, useTaxon } from "sharedHooks";
import useStore from "stores/useStore";

import Match from "./Match";

const setQueryKey = ( selectedPhotoUri, shouldUseEvidenceLocation ) => [
  "scoreImage",
  selectedPhotoUri,
  { shouldUseEvidenceLocation }
];

const initialState = {
  fetchStatus: FETCH_STATUS_LOADING,
  scoreImageParams: null,
  queryKey: [],
  selectedTaxon: null,
  shouldUseEvidenceLocation: false
};

const reducer = ( state, action ) => {
  switch ( action.type ) {
    case "SET_UPLOAD_PARAMS":
      return {
        ...state,
        scoreImageParams: action.scoreImageParams,
        queryKey: setQueryKey( state.selectedPhotoUri, state.shouldUseEvidenceLocation )
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
        fetchStatus: FETCH_STATUS_LOADING,
        scoreImageParams: action.scoreImageParams,
        shouldUseEvidenceLocation: action.shouldUseEvidenceLocation,
        queryKey: setQueryKey( state.selectedPhotoUri, action.shouldUseEvidenceLocation )
      };
    default:
      throw new Error( );
  }
};

const MatchContainer = ( ) => {
  const hasLoadedRef = useRef( false );
  const currentObservation = useStore( state => state.currentObservation );
  const matchScreenSuggestion = useStore( state => state.matchScreenSuggestion );
  const navigation = useNavigation( );
  const { hasPermissions, renderPermissionsGate, requestPermissions } = useLocationPermission( );

  const obsPhotos = currentObservation?.observationPhotos;

  const observationPhoto = obsPhotos?.[0]?.photo?.url
    || obsPhotos?.[0]?.photo?.localFilePath;

  const { taxon } = useTaxon( matchScreenSuggestion?.taxon );

  const navToTaxonDetails = ( ) => {
    navigation.push( "TaxonDetails", {
      id: taxon?.id,
      hideNavButtons: true
    } );
  };

  const handleSaveOrDiscardPress = action => console.log( action, "action" );

  const openLocationPicker = ( ) => {
    navigation.navigate( "LocationPicker" );
  };

  const handleLocationPickerPressed = ( ) => {
    if ( hasPermissions ) {
      openLocationPicker( );
    } else {
      requestPermissions( );
    }
  };

  const { isConnected } = useNetInfo( );

  const evidenceHasLocation = !!currentObservation?.latitude;

  const [state, dispatch] = useReducer( reducer, {
    ...initialState,
    shouldUseEvidenceLocation: evidenceHasLocation
  } );

  const {
    scoreImageParams,
    fetchStatus,
    queryKey,
    shouldUseEvidenceLocation
  } = state;

  const shouldFetchOnlineSuggestions = ( hasPermissions !== undefined )
      && fetchStatus === FETCH_STATUS_LOADING;

  const onlineSuggestionsAttempted = fetchStatus === FETCH_STATUS_ONLINE_FETCHED
      || fetchStatus === FETCH_STATUS_ONLINE_ERROR;

  const onFetchError = useCallback( ( { isOnline } ) => dispatch( {
    type: "SET_FETCH_STATUS",
    fetchStatus: isOnline
      ? FETCH_STATUS_ONLINE_ERROR
      : FETCH_STATUS_OFFLINE_ERROR
  } ), [] );

  const onFetched = useCallback( ( { isOnline } ) => dispatch( {
    type: "SET_FETCH_STATUS",
    fetchStatus: isOnline
      ? FETCH_STATUS_ONLINE_FETCHED
      : FETCH_STATUS_OFFLINE_FETCHED
  } ), [] );

  const {
    suggestions
  } = useSuggestions( observationPhoto, {
    shouldFetchOnlineSuggestions,
    onFetchError,
    onFetched,
    scoreImageParams,
    queryKey,
    onlineSuggestionsAttempted
  } );

  const onTaxonChosen = useCallback( selectedTaxon => {
    dispatch( {
      type: "SELECT_TAXON",
      selectedTaxon
    } );
  }, [] );

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

  const setImageParams = useCallback( async ( ) => {
    if ( isConnected === false ) {
      return;
    }
    const newImageParams = await createUploadParams( observationPhoto, shouldUseEvidenceLocation );
    dispatch( { type: "SET_UPLOAD_PARAMS", scoreImageParams: newImageParams } );
  }, [
    createUploadParams,
    isConnected,
    observationPhoto,
    shouldUseEvidenceLocation
  ] );

  useEffect( ( ) => {
    const onFocus = navigation.addListener( "focus", ( ) => {
      // resizeImage crashes if trying to resize an https:// photo while there is no internet
      // in this situation, we can skip creating upload parameters since we're loading
      // offline suggestions anyway
      if ( !hasLoadedRef.current && _.isEqual( initialSuggestions, suggestions ) ) {
        hasLoadedRef.current = true;
        setImageParams( );
      }
    } );
    return onFocus;
  }, [navigation, setImageParams, suggestions] );

  if ( fetchStatus === FETCH_STATUS_LOADING ) {
    return null;
  }

  if ( suggestions?.otherSuggestions?.length > 0 && !suggestions?.topSuggestion ) {
    const newTopSuggestion = suggestions?.otherSuggestions.pop( );
    suggestions.topSuggestion = newTopSuggestion;
  }

  return (
    <>
      <Match
        observation={currentObservation}
        observationPhoto={observationPhoto}
        onTaxonChosen={onTaxonChosen}
        handleSaveOrDiscardPress={handleSaveOrDiscardPress}
        navToTaxonDetails={navToTaxonDetails}
        taxon={taxon}
        handleLocationPickerPressed={handleLocationPickerPressed}
        suggestions={suggestions}
      />
      {renderPermissionsGate( { onPermissionGranted: openLocationPicker } )}
    </>
  );
};

export default MatchContainer;
