import {
  useNetInfo
} from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import flattenUploadParams from "components/Suggestions/helpers/flattenUploadParams.ts";
import _ from "lodash";
import React, { useCallback, useEffect, useReducer } from "react";
import { useLocationPermission, useSuggestions } from "sharedHooks";

import AdditionalSuggestionsScroll from "./AdditionalSuggestionsScroll";

const initialSuggestions = {
  otherSuggestions: [],
  topSuggestion: null,
  topSuggestionType: "none"
};

const setQueryKey = ( selectedPhotoUri, shouldUseEvidenceLocation ) => [
  "scoreImage",
  selectedPhotoUri,
  { shouldUseEvidenceLocation }
];

const initialState = {
  // loading, online-fetched, online-error, offline-fetched, offline-error
  fetchStatus: "loading",
  flattenedUploadParams: null,
  queryKey: [],
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
    default:
      throw new Error( );
  }
};

const AdditionalSuggestionsScrollContainer = ( {
  observation: currentObservation,
  observationPhoto: selectedPhotoUri
} ) => {
  const {
    hasPermissions
  } = useLocationPermission( );
  const navigation = useNavigation( );
  const { isConnected } = useNetInfo( );

  const evidenceHasLocation = !!currentObservation?.latitude;

  const [state, dispatch] = useReducer( reducer, {
    ...initialState,
    selectedPhotoUri,
    shouldUseEvidenceLocation: evidenceHasLocation
  } );

  const {
    flattenedUploadParams,
    fetchStatus,
    queryKey,
    shouldUseEvidenceLocation
  } = state;

  const shouldFetchOnlineSuggestions = ( hasPermissions !== undefined )
    && fetchStatus === "loading";

  const onlineSuggestionsAttempted = fetchStatus === "online-fetched"
    || fetchStatus === "online-error";

  const {
    suggestions
  } = useSuggestions( {
    shouldFetchOnlineSuggestions,
    dispatch,
    flattenedUploadParams,
    queryKey,
    selectedPhotoUri,
    onlineSuggestionsAttempted
  } );

  const onTaxonChosen = taxon => {
    dispatch( {
      type: "SELECT_TAXON",
      selectedTaxon: taxon
    } );
  };

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
    const newImageParams = await createUploadParams( selectedPhotoUri, shouldUseEvidenceLocation );
    dispatch( { type: "FLATTEN_UPLOAD_PARAMS", flattenedUploadParams: newImageParams } );
  }, [
    createUploadParams,
    isConnected,
    selectedPhotoUri,
    shouldUseEvidenceLocation
  ] );

  useEffect( ( ) => {
    const onFocus = navigation.addListener( "focus", ( ) => {
      // resizeImage crashes if trying to resize an https:// photo while there is no internet
      // in this situation, we can skip creating upload parameters since we're loading
      // offline suggestions anyway
      if ( _.isEqual( initialSuggestions, suggestions ) ) {
        setImageParams( );
      }
    } );
    return onFocus;
  }, [
    navigation,
    setImageParams,
    suggestions
  ] );

  // this code is only necessary because we're returning values from useSuggestions in the
  // format needed for the Suggestions screen. feel free to rewrite useSuggestions
  // so it returns this directly when you're on the Match screen
  const suggestionsList = [];
  if ( suggestions?.topSuggestion ) {
    suggestionsList.push( suggestions.topSuggestion, ...suggestions.otherSuggestions );
  } else {
    suggestionsList.push( ...suggestions.otherSuggestions );
  }

  return (
    <AdditionalSuggestionsScroll
      onTaxonChosen={onTaxonChosen}
      suggestions={suggestionsList}
    />
  );
};

export default AdditionalSuggestionsScrollContainer;
