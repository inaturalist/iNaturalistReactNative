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
import { RealmContext } from "providers/contexts.ts";
import React, {
  useCallback, useEffect, useReducer, useRef
} from "react";
import saveObservation from "sharedHelpers/saveObservation.ts";
import {
  useExitObservationFlow, useLocationPermission, useSuggestions
} from "sharedHooks";
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
  shouldUseEvidenceLocation: false,
  orderedSuggestions: []
};

const reducer = ( state, action ) => {
  switch ( action.type ) {
    case "SET_UPLOAD_PARAMS":
      return {
        ...state,
        scoreImageParams: action.scoreImageParams,
        queryKey: setQueryKey( state.selectedPhotoUri, state.shouldUseEvidenceLocation )
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
    case "ORDER_SUGGESTIONS":
      return {
        ...state,
        orderedSuggestions: action.orderedSuggestions
      };
    default:
      throw new Error( );
  }
};
const { useRealm } = RealmContext;

const MatchContainer = ( ) => {
  const hasLoadedRef = useRef( false );
  const currentObservation = useStore( state => state.currentObservation );
  const getCurrentObservation = useStore( state => state.getCurrentObservation );
  const cameraRollUris = useStore( state => state.cameraRollUris );
  // likely need aiCameraSuggestion for loading screen
  // const aICameraSuggestion = useStore( state => state.aICameraSuggestion );
  const updateObservationKeys = useStore( state => state.updateObservationKeys );
  const navigation = useNavigation( );
  const { hasPermissions, renderPermissionsGate, requestPermissions } = useLocationPermission( );

  const obsPhotos = currentObservation?.observationPhotos;

  const observationPhoto = obsPhotos?.[0]?.photo?.url
    || obsPhotos?.[0]?.photo?.localFilePath;

  const realm = useRealm( );
  const exitObservationFlow = useExitObservationFlow( {
    skipStoreReset: true
  } );

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
    shouldUseEvidenceLocation,
    orderedSuggestions
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

  const onSuggestionChosen = useCallback( selection => {
    const suggestionsList = [...orderedSuggestions];

    // make sure to reorder the list by confidence score
    // for when a user taps multiple suggestions and pushes a new top suggestion to
    // the top of the list
    const sortedList = _.orderBy(
      suggestionsList,
      suggestion => suggestion.combined_score || suggestion.score,
      ["desc"]
    );

    // order the chosen suggestion at the beginning of the list, so it
    // can become the new top suggestion
    const chosenIndex = _.findIndex(
      sortedList,
      suggestion => suggestion.taxon.id === selection.taxon.id
    );
    if ( chosenIndex !== -1 ) {
      const newList = [
        selection, // Add selected item at the beginning
        ...sortedList.slice( 0, chosenIndex ), // Items before the selected one
        ...sortedList.slice( chosenIndex + 1 ) // Items after the selected one
      ];

      dispatch( {
        type: "ORDER_SUGGESTIONS",
        orderedSuggestions: newList
      } );
    }
  }, [orderedSuggestions] );

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

  useEffect( ( ) => {
    if ( !suggestions || suggestions.length === 0 ) {
      return;
    }
    const orderedList = [...suggestions.otherSuggestions];
    if ( suggestions?.topSuggestion ) {
      orderedList.unshift( suggestions?.topSuggestion );
    }
    // make sure list is in order of confidence score
    const sortedList = _.orderBy(
      orderedList,
      suggestion => suggestion.combined_score || suggestion.score,
      ["desc"]
    );
    dispatch( {
      type: "ORDER_SUGGESTIONS",
      orderedSuggestions: sortedList
    } );
  }, [suggestions] );

  if ( fetchStatus === FETCH_STATUS_LOADING ) {
    return null;
  }

  const otherSuggestionsLoading = fetchStatus === FETCH_STATUS_LOADING;

  const topSuggestion = _.first( orderedSuggestions );
  const otherSuggestions = _.without( orderedSuggestions, topSuggestion );

  const taxon = topSuggestion?.taxon;
  const taxonId = taxon?.id;

  const navToTaxonDetails = ( ) => {
    navigation.push( "TaxonDetails", { id: taxonId } );
  };

  const handleSaveOrDiscardPress = async action => {
    if ( action === "save" ) {
      updateObservationKeys( {
        taxon,
        owners_identification_from_vision: true
      } );
      await saveObservation( getCurrentObservation( ), cameraRollUris, realm );
    }
    exitObservationFlow( );
  };

  return (
    <>
      <Match
        observation={currentObservation}
        observationPhoto={observationPhoto}
        onSuggestionChosen={onSuggestionChosen}
        handleSaveOrDiscardPress={handleSaveOrDiscardPress}
        navToTaxonDetails={navToTaxonDetails}
        handleLocationPickerPressed={handleLocationPickerPressed}
        topSuggestion={topSuggestion}
        otherSuggestions={otherSuggestions}
        otherSuggestionsLoading={otherSuggestionsLoading}
      />
      {renderPermissionsGate( { onPermissionGranted: openLocationPicker } )}
    </>
  );
};

export default MatchContainer;
