import {
  useNetInfo
} from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import { Body3, Heading4, ViewWrapper } from "components/SharedComponents";
import { View } from "components/styledComponents";
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
  useCallback, useEffect, useReducer, useRef, useState
} from "react";
import fetchPlaceName from "sharedHelpers/fetchPlaceName";
import saveObservation from "sharedHelpers/saveObservation.ts";
import {
  useExitObservationFlow, useLocationPermission, useSuggestions
} from "sharedHooks";
import { isDebugMode } from "sharedHooks/useDebugMode";
import useStore from "stores/useStore";

import fetchUserLocation from "../../sharedHelpers/fetchUserLocation";
import Match from "./Match";
import PreMatchLoadingScreen from "./PreMatchLoadingScreen";

const setQueryKey = ( selectedPhotoUri, shouldUseEvidenceLocation ) => [
  "scoreImage",
  selectedPhotoUri,
  { shouldUseEvidenceLocation }
];

const FETCH_STATUS_OFFLINE_SKIPPED = "offline-skipped";
const initialState = {
  onlineFetchStatus: FETCH_STATUS_LOADING,
  offlineFetchStatus: FETCH_STATUS_LOADING,
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
        queryKey: setQueryKey( action.scoreImageParams.image.uri, state.shouldUseEvidenceLocation )
      };
    case "SET_ONLINE_FETCH_STATUS":
      return {
        ...state,
        onlineFetchStatus: action.onlineFetchStatus
      };
    case "SET_OFFLINE_FETCH_STATUS":
      return {
        ...state,
        offlineFetchStatus: action.offlineFetchStatus
      };
    case "SET_LOCATION":
      return {
        ...state,
        onlineFetchStatus: FETCH_STATUS_LOADING,
        offlineFetchStatus: FETCH_STATUS_LOADING,
        scoreImageParams: action.scoreImageParams,
        shouldUseEvidenceLocation: action.shouldUseEvidenceLocation,
        queryKey: setQueryKey( action.scoreImageParams.image.uri, action.shouldUseEvidenceLocation )
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
  const isDebug = isDebugMode( );
  const scrollRef = useRef( null );
  const currentObservation = useStore( state => state.currentObservation );
  const getCurrentObservation = useStore( state => state.getCurrentObservation );
  const cameraRollUris = useStore( state => state.cameraRollUris );
  // likely need aiCameraSuggestion for loading screen
  // const aICameraSuggestion = useStore( state => state.aICameraSuggestion );
  const updateObservationKeys = useStore( state => state.updateObservationKeys );
  const navigation = useNavigation( );
  const {
    hasPermissions, renderPermissionsGate, requestPermissions
  } = useLocationPermission( );

  const obsPhotos = currentObservation?.observationPhotos;

  const observationPhoto = obsPhotos?.[0]?.photo?.url
    || obsPhotos?.[0]?.photo?.localFilePath;

  const realm = useRealm( );
  const exitObservationFlow = useExitObservationFlow( {
    skipStoreReset: true
  } );

  const { isConnected } = useNetInfo( );

  const evidenceHasLocation = !!currentObservation?.latitude;

  const [topSuggestion, setTopSuggestion] = useState( );
  const [iconicTaxon, setIconicTaxon] = useState( );

  const [state, dispatch] = useReducer( reducer, {
    ...initialState,
    shouldUseEvidenceLocation: evidenceHasLocation
  } );

  const {
    scoreImageParams,
    onlineFetchStatus,
    offlineFetchStatus,
    queryKey,
    shouldUseEvidenceLocation,
    orderedSuggestions
  } = state;

  const shouldFetchOnlineSuggestions = ( hasPermissions !== undefined )
      && onlineFetchStatus === FETCH_STATUS_LOADING;

  const onlineSuggestionsAttempted = onlineFetchStatus === FETCH_STATUS_ONLINE_FETCHED
      || onlineFetchStatus === FETCH_STATUS_ONLINE_ERROR;

  const onFetchError = useCallback(
    ( { isOnline } ) => ( isOnline
      ? dispatch( {
        type: "SET_ONLINE_FETCH_STATUS",
        onlineFetchStatus: FETCH_STATUS_ONLINE_ERROR
      } )
      : dispatch( {
        type: "SET_OFFLINE_FETCH_STATUS",
        offlineFetchStatus: FETCH_STATUS_OFFLINE_ERROR
      } ) ),
    []
  );

  const onFetched = useCallback(
    ( { isOnline } ) => {
      if ( isOnline ) {
        dispatch( {
          type: "SET_ONLINE_FETCH_STATUS",
          onlineFetchStatus: FETCH_STATUS_ONLINE_FETCHED
        } );
        dispatch( {
          type: "SET_OFFLINE_FETCH_STATUS",
          offlineFetchStatus: FETCH_STATUS_OFFLINE_SKIPPED
        } );
      } else {
        dispatch( {
          type: "SET_OFFLINE_FETCH_STATUS",
          offlineFetchStatus: FETCH_STATUS_OFFLINE_FETCHED
        } );
      }
    },
    []
  );

  const {
    timedOut,
    onlineSuggestionsError,
    onlineSuggestionsUpdatedAt,
    suggestions,
    usingOfflineSuggestions,
    refetchSuggestions
  } = useSuggestions( observationPhoto, {
    shouldFetchOnlineSuggestions,
    onFetchError,
    onFetched,
    scoreImageParams,
    queryKey,
    onlineSuggestionsAttempted
  } );
  const [currentPlaceGuess, setCurrentPlaceGuess] = useState( );

  useEffect( () => {
    if ( !currentPlaceGuess ) return;

    updateObservationKeys( { place_guess: currentPlaceGuess } );
  }, [currentPlaceGuess, updateObservationKeys] );

  const scrollToTop = useCallback( () => {
    if ( scrollRef.current ) {
      scrollRef.current.scrollTo( { y: 0, animated: true } );
    }
  }, [] );

  const getCurrentUserLocation = async ( ) => {
    const currentUserLocation = await fetchUserLocation( );
    const placeGuess
     = await fetchPlaceName( currentUserLocation?.latitude, currentUserLocation?.longitude );

    if ( placeGuess ) {
      // Cannot call updateObservationKeys directly from here, since fetchPlaceName might take
      // a while to return, in the meantime the current copy of the observation might have
      // changed, so we update the observation from useEffect of currentPlaceGuess, so it will
      // always have the latest copy of the current observation (see GH issue #584)
      setCurrentPlaceGuess( placeGuess );
    }
    updateObservationKeys( {
      latitude: currentUserLocation?.latitude,
      longitude: currentUserLocation?.longitude
    } );
    const newScoreImageParams = {
      ...scoreImageParams,
      lat: currentUserLocation?.latitude,
      lng: currentUserLocation?.longitude
    };
    dispatch( {
      type: "SET_LOCATION",
      shouldUseEvidenceLocation: true,
      scoreImageParams: newScoreImageParams
    } );
    refetchSuggestions();
    // Scroll to top of the screen
    scrollToTop( );
  };

  const handleAddLocationPressed = ( ) => {
    if ( hasPermissions ) {
      getCurrentUserLocation();
    } else {
      requestPermissions( );
    }
  };

  const onSuggestionChosen = useCallback( selection => {
    const suggestionsList = [...orderedSuggestions];

    // make sure to reorder the list by confidence score
    // for when a user taps multiple suggestions and pushes a new top suggestion to
    // the top of the list
    const sortedList = _.orderBy(
      suggestionsList,
      suggestion => suggestion.combined_score,
      ["desc"]
    );

    const chosenIndex = _.findIndex(
      sortedList,
      suggestion => suggestion.taxon.id === selection.taxon.id
    );
    if ( chosenIndex !== -1 ) {
      // Set new top suggestion
      setTopSuggestion( sortedList[chosenIndex] );
      // We can set the entire list here since we are filtering out the top suggestion in render
      dispatch( {
        type: "ORDER_SUGGESTIONS",
        orderedSuggestions: sortedList
      } );
    }
    scrollToTop( );
    // TODO: should this set owners_identification_from_vision: false?
  }, [orderedSuggestions, scrollToTop] );

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
      setTopSuggestion( suggestions?.topSuggestion );
      orderedList.unshift( suggestions?.topSuggestion );
    }
    // make sure list is in order of confidence score
    const sortedList = _.orderBy(
      orderedList,
      suggestion => suggestion.combined_score,
      ["desc"]
    );
    dispatch( {
      type: "ORDER_SUGGESTIONS",
      orderedSuggestions: sortedList
    } );
  }, [suggestions] );

  const taxon = topSuggestion?.taxon;
  const taxonId = taxon?.id;

  const suggestionsLoading = onlineFetchStatus === FETCH_STATUS_LOADING
    || offlineFetchStatus === FETCH_STATUS_LOADING;

  // Remove the top suggestion from the list of other suggestions
  const otherSuggestions = orderedSuggestions
    .filter( suggestion => suggestion.taxon.id !== taxonId );

  const navToTaxonDetails = photo => {
    const params = { id: taxonId };
    if ( !photo?.isRepresentativeButOtherTaxon ) {
      params.firstPhotoID = photo.id;
    } else {
      params.representativePhoto = photo;
    }
    navigation.push( "TaxonDetails", params );
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
      <ViewWrapper isDebug={isDebug}>
        <Match
          observation={currentObservation}
          obsPhotos={obsPhotos}
          onSuggestionChosen={onSuggestionChosen}
          handleSaveOrDiscardPress={handleSaveOrDiscardPress}
          navToTaxonDetails={navToTaxonDetails}
          handleAddLocationPressed={handleAddLocationPressed}
          topSuggestion={topSuggestion}
          otherSuggestions={otherSuggestions}
          suggestionsLoading={suggestionsLoading}
          scrollRef={scrollRef}
          iconicTaxon={iconicTaxon}
          setIconicTaxon={setIconicTaxon}
        />
        {renderPermissionsGate( { onPermissionGranted: getCurrentUserLocation } )}
        {/* eslint-disable i18next/no-literal-string */}
        {/* eslint-disable react/jsx-one-expression-per-line */}
        {/* eslint-disable max-len */}
        { isDebug && (
          <View className="bg-deeppink text-white p-3">
            <Heading4 className="text-white">Diagnostics</Heading4>
            <Body3 className="text-white">
              Online fetch status:
              {JSON.stringify( onlineFetchStatus )}
            </Body3>
            <Body3 className="text-white">
              Offline fetch status:
              {JSON.stringify( offlineFetchStatus )}
            </Body3>
            <Body3 className="text-white">
              Lat/lng:
              {JSON.stringify( currentObservation?.latitude )}
              {JSON.stringify( currentObservation?.longitude )}
            </Body3>
            <Body3 className="text-white">
              Using offline suggestions:
              {JSON.stringify( usingOfflineSuggestions )}
            </Body3>
            <Body3 className="text-white">
              Timed out:
              {JSON.stringify( timedOut )}
            </Body3>
            <Body3 className="text-white">
              Online suggestions error:
              {JSON.stringify( onlineSuggestionsError )}
            </Body3>
            <Body3 className="text-white">
              Online suggestions updated at:
              {JSON.stringify( onlineSuggestionsUpdatedAt )}
            </Body3>
          </View>
        )}
      </ViewWrapper>
      <PreMatchLoadingScreen
        isLoading={suggestionsLoading}
      />
    </>
  );
};

export default MatchContainer;
