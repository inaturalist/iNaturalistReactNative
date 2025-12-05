import {
  useNetInfo
} from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ApiSuggestion, ApiTaxon } from "api/types";
import { Body3, Heading4, ViewWrapper } from "components/SharedComponents";
import { View } from "components/styledComponents";
import flattenUploadParams from "components/Suggestions/helpers/flattenUploadParams";
import {
  FETCH_STATUS_LOADING,
  FETCH_STATUS_OFFLINE_ERROR,
  FETCH_STATUS_OFFLINE_FETCHED,
  FETCH_STATUS_OFFLINE_SKIPPED,
  FETCH_STATUS_ONLINE_ERROR,
  FETCH_STATUS_ONLINE_FETCHED,
  FETCH_STATUS_ONLINE_SKIPPED,
  initialSuggestions
} from "components/Suggestions/SuggestionsContainer";
import _ from "lodash";
import { RealmContext } from "providers/contexts";
import React, {
  useCallback,
  useEffect, useReducer, useRef, useState
} from "react";
import type { ScrollView } from "react-native";
import fetchPlaceName from "sharedHelpers/fetchPlaceName";
import saveObservation from "sharedHelpers/saveObservation";
import shouldFetchObservationLocation from "sharedHelpers/shouldFetchObservationLocation";
import {
  useExitObservationFlow, useLocationPermission, useSuggestions, useWatchPosition
} from "sharedHooks";
import { isDebugMode } from "sharedHooks/useDebugMode";
import useStore from "stores/useStore";

import tryToReplaceWithLocalTaxon from "./helpers/tryToReplaceWithLocalTaxon";
import Match from "./Match";
import PreMatchLoadingScreen from "./PreMatchLoadingScreen";

interface ImageParamsType {
  uri?: string;
  image: {
    uri: string;
  };
  lat?: number;
  lng?: number;
}

interface NavParams {
      id?: number | string;
      firstPhotoID?: number | string;
      representativePhoto?: { isRepresentativeButOtherTaxon?: boolean; id?: number | string };
    }

interface StateType {
  onlineFetchStatus: string;
  offlineFetchStatus: string;
  scoreImageParams: ImageParamsType | null;
  queryKey: ( string | { shouldUseEvidenceLocation: boolean } )[];
  shouldUseEvidenceLocation: boolean;
  orderedSuggestions: ApiSuggestion[];
}

type ActionType =
  | { type: "SET_UPLOAD_PARAMS"; scoreImageParams: ImageParamsType }
  | { type: "SET_ONLINE_FETCH_STATUS"; onlineFetchStatus: string }
  | { type: "SET_OFFLINE_FETCH_STATUS"; offlineFetchStatus: string }
  | { type: "SET_LOCATION"; scoreImageParams: ImageParamsType; shouldUseEvidenceLocation: boolean }
  | { type: "ORDER_SUGGESTIONS"; orderedSuggestions: ApiSuggestion[] };

const setQueryKey = ( selectedPhotoUri: string, shouldUseEvidenceLocation: boolean ) => [
  "scoreImage",
  selectedPhotoUri,
  { shouldUseEvidenceLocation }
];

const initialState: StateType = {
  onlineFetchStatus: FETCH_STATUS_LOADING,
  offlineFetchStatus: FETCH_STATUS_LOADING,
  scoreImageParams: null,
  queryKey: [],
  shouldUseEvidenceLocation: false,
  orderedSuggestions: []
};

const reducer = ( state: StateType, action: ActionType ): StateType => {
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
  const scrollRef = useRef<ScrollView | null>( null );
  const currentObservation = useStore( state => state.currentObservation );
  const getCurrentObservation = useStore( state => state.getCurrentObservation );
  const cameraRollUris = useStore( state => state.cameraRollUris );
  const updateObservationKeys = useStore( state => state.updateObservationKeys );
  const navigation = useNavigation<NativeStackNavigationProp<Record<string, NavParams>>>( );
  const {
    hasPermissions,
    renderPermissionsGate,
    requestPermissions
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

  const [topSuggestion, setTopSuggestion] = useState<ApiSuggestion | undefined>( );
  const [iconicTaxon, setIconicTaxon] = useState<ApiTaxon | undefined>( );
  const [currentUserLocation, setCurrentUserLocation] = useState<{
    latitude?: number;
    longitude?: number;
  } | null>( null );

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
    ( { isOnline }: { isOnline: boolean } ) => {
      if ( isOnline ) {
        dispatch( {
          type: "SET_ONLINE_FETCH_STATUS",
          onlineFetchStatus: FETCH_STATUS_ONLINE_ERROR
        } );
      } else {
        dispatch( {
          type: "SET_OFFLINE_FETCH_STATUS",
          offlineFetchStatus: FETCH_STATUS_OFFLINE_ERROR
        } );
        // If offline is finished, and online still in loading state it means it never started
        if ( onlineFetchStatus === FETCH_STATUS_LOADING ) {
          dispatch( {
            type: "SET_ONLINE_FETCH_STATUS",
            onlineFetchStatus: FETCH_STATUS_ONLINE_SKIPPED
          } );
        }
      }
    },
    [onlineFetchStatus]
  );

  const onFetched = useCallback(
    ( { isOnline }: { isOnline: boolean } ) => {
      if ( isOnline ) {
        dispatch( {
          type: "SET_ONLINE_FETCH_STATUS",
          onlineFetchStatus: FETCH_STATUS_ONLINE_FETCHED
        } );
        // Currently we start offline only when online has an error, so
        // we can register offline as skipped if online is successful
        dispatch( {
          type: "SET_OFFLINE_FETCH_STATUS",
          offlineFetchStatus: FETCH_STATUS_OFFLINE_SKIPPED
        } );
      } else {
        dispatch( {
          type: "SET_OFFLINE_FETCH_STATUS",
          offlineFetchStatus: FETCH_STATUS_OFFLINE_FETCHED
        } );
        // If offline is finished, and online still in loading state it means it never started
        if ( onlineFetchStatus === FETCH_STATUS_LOADING ) {
          dispatch( {
            type: "SET_ONLINE_FETCH_STATUS",
            onlineFetchStatus: FETCH_STATUS_ONLINE_SKIPPED
          } );
        }
      }
    },
    [onlineFetchStatus]
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

  const [currentPlaceGuess, setCurrentPlaceGuess] = useState<string | undefined>( );
  const [hasRefetchedSuggestions, setHasRefetchedSuggestions] = useState( false );

  const scrollToTop = useCallback( () => {
    if ( scrollRef.current ) {
      scrollRef.current.scrollTo( { y: 0, animated: true } );
    }
  }, [] );

  const [needLocation, setNeedLocation] = useState(
    shouldFetchObservationLocation( currentObservation )
  );
  const shouldFetchLocation = !!( hasPermissions && needLocation );

  const {
    isFetchingLocation,
    stopWatch,
    subscriptionId,
    userLocation
  } = useWatchPosition( { shouldFetchLocation } );

  const navToLocationPicker = useCallback( ( ) => {
    stopWatch( subscriptionId );
    navigation.navigate( "LocationPicker" );
  }, [stopWatch, subscriptionId, navigation] );

  const latitude = currentObservation?.latitude;
  const longitude = currentObservation?.longitude;
  const hasLocation = !!( latitude && longitude );

  const handleAddLocationPressed = ( ) => {
    if ( !hasLocation && !hasPermissions ) {
      requestPermissions();
    } else {
      navToLocationPicker();
    }
  };

  const getCurrentUserPlaceName = useCallback( async () => {
    if ( currentUserLocation?.latitude ) {
      const placeGuess
      = await fetchPlaceName( currentUserLocation?.latitude, currentUserLocation?.longitude );
      if ( placeGuess ) {
        // Cannot call updateObservationKeys directly from here, since fetchPlaceName might take
        // a while to return, in the meantime the current copy of the observation might have
        // changed, so we update the observation from useEffect of currentPlaceGuess, so it will
        // always have the latest copy of the current observation (see GH issue #584)
        setCurrentPlaceGuess( placeGuess );
      }
    }
  }, [currentUserLocation] );

  const handleRefetchSuggestions = useCallback( () => {
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
    setHasRefetchedSuggestions( true );
    // // Scroll to top of the screen
    scrollToTop( );
  }, [
    refetchSuggestions,
    scoreImageParams,
    scrollToTop,
    currentUserLocation?.latitude,
    currentUserLocation?.longitude
  ] );

  useEffect( () => {
    if ( currentUserLocation?.latitude && !hasRefetchedSuggestions && suggestions ) {
      handleRefetchSuggestions();
    }
  }, [
    currentUserLocation,
    getCurrentUserPlaceName,
    handleRefetchSuggestions,
    hasRefetchedSuggestions,
    suggestions
  ] );

  useEffect( ( ) => {
    if ( !scoreImageParams ) return;
    if ( userLocation === currentUserLocation ) {
      return;
    }
    if ( userLocation?.latitude ) {
      setCurrentUserLocation( userLocation );
      getCurrentUserPlaceName( );
      updateObservationKeys( userLocation );
    }
  }, [
    userLocation,
    updateObservationKeys,
    handleRefetchSuggestions,
    stopWatch,
    subscriptionId,
    currentUserLocation,
    scoreImageParams,
    getCurrentUserPlaceName
  ] );

  useEffect( () => {
    if ( !currentPlaceGuess ) return;
    updateObservationKeys( { place_guess: currentPlaceGuess } );
  }, [currentPlaceGuess, updateObservationKeys] );

  const onSuggestionChosen = useCallback( ( selection: ApiSuggestion ) => {
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

  const createUploadParams = useCallback( async ( uri: string, showLocation: boolean ) => {
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
    const unsubscribe = navigation.addListener( "focus", ( ) => {
      // resizeImage crashes if trying to resize an https:// photo while there is no internet
      // in this situation, we can skip creating upload parameters since we're loading
      // offline suggestions anyway
      if ( !hasLoadedRef.current && _.isEqual( initialSuggestions, suggestions ) ) {
        hasLoadedRef.current = true;
        setImageParams( );
      }
    } );
    return unsubscribe;
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

  // not the prettiest code; trying to be consistent about showing common name
  // and taxon photo for offline suggestions in AICamera and otherSuggestions
  // without relying on the useTaxon hook which only deals with one taxon at a time
  const topSuggestionInRealm = realm.objects( "Taxon" ).filtered( "id IN $0", [taxonId] );
  const topSuggestionWithLocalTaxon = tryToReplaceWithLocalTaxon(
    topSuggestionInRealm,
    topSuggestion
  );

  const suggestionsLoading = onlineFetchStatus === FETCH_STATUS_LOADING
    || offlineFetchStatus === FETCH_STATUS_LOADING;

  // Remove the top suggestion from the list of other suggestions
  const otherSuggestions = orderedSuggestions
    .filter( suggestion => suggestion.taxon.id !== taxonId );

  const navToTaxonDetails
  = ( photo?: { isRepresentativeButOtherTaxon?: boolean; id?: number | string } ) => {
    const navParams: NavParams = { id: taxonId };
    if ( !photo?.isRepresentativeButOtherTaxon ) {
      navParams.firstPhotoID = photo?.id;
    } else {
      navParams.representativePhoto = photo;
    }
    navigation.push( "TaxonDetails", navParams );
  };

  const handleSaveOrDiscardPress = async ( action: string ) => {
    if ( action === "save" ) {
      updateObservationKeys( {
        taxon: taxon || iconicTaxon,
        owners_identification_from_vision: true
      } );
      await saveObservation( getCurrentObservation( ), cameraRollUris, realm );
    }
    stopWatch( subscriptionId );
    exitObservationFlow( );
  };

  const taxonIds = otherSuggestions?.map( suggestion => suggestion.taxon.id );
  const localTaxa = realm.objects( "Taxon" ).filtered( "id IN $0", taxonIds );

  // show local taxon photos in additional suggestions list if they're available
  const suggestionsWithLocalTaxonPhotos = otherSuggestions
    .map( suggestion => tryToReplaceWithLocalTaxon( localTaxa, suggestion ) );

  return (
    <>
      <ViewWrapper isDebug={isDebug} useTopInset={false}>
        <Match
          observation={currentObservation}
          obsPhotos={obsPhotos}
          onSuggestionChosen={onSuggestionChosen}
          handleSaveOrDiscardPress={handleSaveOrDiscardPress}
          navToTaxonDetails={navToTaxonDetails}
          isFetchingLocation={isFetchingLocation}
          handleAddLocationPressed={handleAddLocationPressed}
          topSuggestion={topSuggestionWithLocalTaxon}
          otherSuggestions={suggestionsWithLocalTaxonPhotos}
          suggestionsLoading={suggestionsLoading}
          scrollRef={scrollRef}
          iconicTaxon={iconicTaxon}
          setIconicTaxon={setIconicTaxon}
        />
        {renderPermissionsGate( {
          // If the user grants location permission while on this screen,
          // we want to start watching the location no matter how the observation
          // was created (camera, sound recorder, etc.)
          onPermissionGranted: () => {
            setNeedLocation( true );
            getCurrentUserPlaceName( );
          },
          // If the user does not give location permissions in any form,
          // navigate to the location picker (if granted we just continue fetching the location)
          onModalHide: ( ) => {
            if ( !hasPermissions ) navToLocationPicker( );
          }
        } )}
        {/* eslint-disable i18next/no-literal-string */}
        {/* eslint-disable react/jsx-one-expression-per-line */}
        {/* eslint-disable max-len */}
        {isDebug && (
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
      <PreMatchLoadingScreen isLoading={suggestionsLoading} />
    </>
  );
};

export default MatchContainer;
