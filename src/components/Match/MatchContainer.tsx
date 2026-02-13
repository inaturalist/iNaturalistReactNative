import {
  useNetInfo,
} from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ApiPhoto, ApiSuggestion } from "api/types";
import { Body3, Heading4, ViewWrapper } from "components/SharedComponents";
import { View } from "components/styledComponents";
import flattenUploadParams from "components/Suggestions/helpers/flattenUploadParams";
import {
  FETCH_STATUSES,
} from "components/Suggestions/SuggestionsContainer";
import { isEqual } from "lodash";
import orderBy from "lodash/orderBy";
import { RealmContext } from "providers/contexts";
import React, {
  useCallback,
  useEffect, useMemo, useReducer, useRef, useState,
} from "react";
import type { ScrollView } from "react-native";
import type { RealmPhoto, RealmTaxon } from "realmModels/types";
import fetchPlaceName from "sharedHelpers/fetchPlaceName";
import saveObservation from "sharedHelpers/saveObservation";
import shouldFetchObservationLocation from "sharedHelpers/shouldFetchObservationLocation";
import {
  useExitObservationFlow, useLocationPermission, useSuggestions, useWatchPosition,
} from "sharedHooks";
import { isDebugMode } from "sharedHooks/useDebugMode";
import {
  internalUseSuggestionsInitialSuggestions,
} from "sharedHooks/useSuggestions/filterSuggestions";
import { FIREBASE_TRACE_ATTRIBUTES, FIREBASE_TRACES } from "stores/createFirebaseTraceSlice";
import useStore from "stores/useStore";

import tryToReplaceWithLocalTaxon from "./helpers/tryToReplaceWithLocalTaxon";
import Match from "./Match";
import PreMatchLoadingScreen from "./PreMatchLoadingScreen";

interface ImageParamsType {
  uri?: string;
  image: {
    uri: string;
    name: string;
    type: string;
  };
  lat?: number;
  lng?: number;
}

interface NavParams {
  id?: number | string;
  firstPhotoID?: number | string;
  representativePhoto?: { isRepresentativeButOtherTaxon?: boolean; id?: number | string };
}

interface State {
  onlineFetchStatus: FETCH_STATUSES;
  offlineFetchStatus: FETCH_STATUSES;
  scoreImageParams: ImageParamsType | null;
  queryKey: ( string | { shouldUseEvidenceLocation: boolean } )[];
  shouldUseEvidenceLocation: boolean;
}

export type MatchButtonAction = "save" | "discard";

type Action =
  | { type: "SET_UPLOAD_PARAMS"; scoreImageParams: ImageParamsType }
  | { type: "SET_ONLINE_FETCH_STATUS"; onlineFetchStatus: FETCH_STATUSES }
  | { type: "SET_OFFLINE_FETCH_STATUS"; offlineFetchStatus: FETCH_STATUSES }
  | { type: "SET_LOCATION"; scoreImageParams: ImageParamsType; shouldUseEvidenceLocation: boolean }
  | { type: "ORDER_SUGGESTIONS"; orderedSuggestions: ApiSuggestion[] };

const getQueryKey = ( selectedPhotoUri: string, shouldUseEvidenceLocation: boolean ) => [
  "scoreImage",
  selectedPhotoUri,
  { shouldUseEvidenceLocation },
];

const initialState: State = {
  onlineFetchStatus: FETCH_STATUSES.FETCH_STATUS_LOADING,
  offlineFetchStatus: FETCH_STATUSES.FETCH_STATUS_LOADING,
  scoreImageParams: null,
  queryKey: [],
  shouldUseEvidenceLocation: false,
};

const reducer = ( state: State, action: Action ): State => {
  switch ( action.type ) {
    case "SET_UPLOAD_PARAMS":
      return {
        ...state,
        scoreImageParams: action.scoreImageParams,
        queryKey: getQueryKey( action.scoreImageParams.image.uri, state.shouldUseEvidenceLocation ),
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
    case "SET_LOCATION":
      return {
        ...state,
        onlineFetchStatus: FETCH_STATUSES.FETCH_STATUS_LOADING,
        offlineFetchStatus: FETCH_STATUSES.FETCH_STATUS_LOADING,
        scoreImageParams: action.scoreImageParams,
        shouldUseEvidenceLocation: action.shouldUseEvidenceLocation,
        queryKey: getQueryKey(
          action.scoreImageParams.image.uri,
          action.shouldUseEvidenceLocation,
        ),
      };
    default:
      throw new Error( );
  }
};
const { useRealm } = RealmContext;

const MatchContainer = ( ) => {
  const hasLoadedRef = useRef( false );
  const isDebug = isDebugMode( );
  const scrollRef = useRef<ScrollView>( null );
  const currentObservation = useStore( state => state.currentObservation );
  const getCurrentObservation = useStore( state => state.getCurrentObservation );
  const cameraRollUris = useStore( state => state.cameraRollUris );
  const updateObservationKeys = useStore( state => state.updateObservationKeys );
  const navigation = useNavigation<NativeStackNavigationProp<Record<string, NavParams>>>( );
  const {
    hasPermissions,
    renderPermissionsGate,
    requestPermissions,
  } = useLocationPermission( );

  const obsPhotos = currentObservation?.observationPhotos;

  const observationPhoto = obsPhotos?.[0]?.photo?.url
    || obsPhotos?.[0]?.photo?.localFilePath;

  const realm = useRealm( );
  const exitObservationFlow = useExitObservationFlow( {
    skipStoreReset: true,
  } );

  const { isConnected } = useNetInfo( );

  const evidenceHasLocation = !!currentObservation?.latitude;

  const [iconicTaxon, setIconicTaxon] = useState<RealmTaxon>( );
  const [currentUserLocation, setCurrentUserLocation] = useState<{
    latitude?: number;
    longitude?: number;
  } | null>( null );

  const [state, dispatch] = useReducer( reducer, {
    ...initialState,
    shouldUseEvidenceLocation: evidenceHasLocation,
  } );

  const stopFirebaseTrace = useStore( state => state.stopFirebaseTrace );

  const {
    scoreImageParams,
    onlineFetchStatus,
    offlineFetchStatus,
    queryKey,
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
    onlineSuggestionsError,
    onlineSuggestionsUpdatedAt,
    suggestions,
    usingOfflineSuggestions,
    refetchSuggestions,
  } = useSuggestions( observationPhoto, {
    shouldFetchOnlineSuggestions,
    onFetchError,
    onFetched,
    scoreImageParams,
    queryKey,
    onlineSuggestionsAttempted,
  } );

  const [hasRefetchedSuggestions, setHasRefetchedSuggestions] = useState( false );
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<number | null>( null );

  const orderedSuggestions = useMemo( () => {
    if ( !suggestions || suggestions.length === 0 ) return [];

    const orderedList = [...suggestions.otherSuggestions];
    if ( suggestions?.topSuggestion ) {
      orderedList.unshift( suggestions.topSuggestion );
    }

    return orderBy(
      orderedList,
      suggestion => suggestion.combined_score,
      ["desc"],
    );
  }, [suggestions] );

  const topSuggestion = useMemo( () => {
    if ( selectedSuggestionId ) {
      return orderedSuggestions.find( s => s.taxon.id === selectedSuggestionId );
    }
    return suggestions?.topSuggestion;
  }, [suggestions, orderedSuggestions, selectedSuggestionId] );

  const scrollToTop = useCallback( () => {
    if ( scrollRef.current ) {
      scrollRef.current.scrollTo( { y: 0, animated: true } );
    }
  }, [] );

  const [needLocation, setNeedLocation] = useState(
    shouldFetchObservationLocation( currentObservation ),
  );
  const shouldFetchLocation = !!( hasPermissions && needLocation );

  const {
    isFetchingLocation,
    stopWatch,
    subscriptionId,
    userLocation,
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
        updateObservationKeys( { place_guess: placeGuess } );
      }
    }
  }, [currentUserLocation, updateObservationKeys] );

  const handleRefetchSuggestions = useCallback( () => {
    const newScoreImageParams = {
      ...scoreImageParams,
      lat: currentUserLocation?.latitude,
      lng: currentUserLocation?.longitude,
    };
    dispatch( {
      type: "SET_LOCATION",
      shouldUseEvidenceLocation: true,
      scoreImageParams: newScoreImageParams,
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
    currentUserLocation?.longitude,
  ] );

  useEffect( () => {
    if ( !scoreImageParams ) return;
    if ( userLocation === currentUserLocation ) return;
    if ( !userLocation?.latitude ) return;

    setCurrentUserLocation( userLocation );
    updateObservationKeys( userLocation );

    getCurrentUserPlaceName();

    if ( !hasRefetchedSuggestions && suggestions ) {
      handleRefetchSuggestions();
    }
  }, [
    userLocation,
    currentUserLocation,
    scoreImageParams,
    suggestions,
    hasRefetchedSuggestions,
    updateObservationKeys,
    getCurrentUserPlaceName,
    handleRefetchSuggestions,
  ] );

  const onSuggestionChosen = useCallback( ( selection: ApiSuggestion ) => {
    setSelectedSuggestionId( selection.taxon.id );
    scrollToTop( );
    // TODO: should this set owners_identification_from_vision: false?
  }, [scrollToTop] );

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
    shouldUseEvidenceLocation,
  ] );

  useEffect( ( ) => {
    const unsubscribe = navigation.addListener( "focus", ( ) => {
      // resizeImage crashes if trying to resize an https:// photo while there is no internet
      // in this situation, we can skip creating upload parameters since we're loading
      // offline suggestions anyway
      if ( !hasLoadedRef.current
        // TODO: part of MOB-1081, see `internalUseSuggestionsInitialSuggestions`
        // we shouldn't rely on implementation internals to consumer drive state
        && isEqual( internalUseSuggestionsInitialSuggestions, suggestions )
      ) {
        hasLoadedRef.current = true;
        setImageParams( );
      }
    } );
    return unsubscribe;
  }, [navigation, setImageParams, suggestions] );

  const taxon = topSuggestion?.taxon;
  const taxonId = taxon?.id;

  // not the prettiest code; trying to be consistent about showing common name
  // and taxon photo for offline suggestions in AICamera and otherSuggestions
  // without relying on the useTaxon hook which only deals with one taxon at a time
  const topSuggestionInRealm = realm.objects( "Taxon" ).filtered( "id IN $0", [taxonId] );
  const topSuggestionWithLocalTaxon = tryToReplaceWithLocalTaxon(
    topSuggestionInRealm,
    topSuggestion,
  );

  const suggestionsLoading = onlineFetchStatus === FETCH_STATUSES.FETCH_STATUS_LOADING
    || offlineFetchStatus === FETCH_STATUSES.FETCH_STATUS_LOADING;

  useEffect( ( ) => {
    if (
      onlineSuggestionsAttempted
      && !suggestionsLoading
    ) {
      // This should capture a case where online and offline have had a chance to load
      stopFirebaseTrace(
        FIREBASE_TRACES.AI_CAMERA_TO_MATCH,
        { [FIREBASE_TRACE_ATTRIBUTES.ONLINE]: `${!usingOfflineSuggestions}` },
      );
    }
  }, [
    onlineSuggestionsAttempted,
    suggestionsLoading,
    stopFirebaseTrace,
    usingOfflineSuggestions,
  ] );

  // Remove the top suggestion from the list of other suggestions
  const otherSuggestions = orderedSuggestions
    .filter( suggestion => suggestion.taxon.id !== taxonId );

  const navToTaxonDetails
  = ( photo?: ApiPhoto | RealmPhoto ) => {
    const navParams: NavParams = { id: taxonId };
    if ( !photo?.isRepresentativeButOtherTaxon ) {
      navParams.firstPhotoID = photo?.id;
    } else {
      navParams.representativePhoto = photo;
    }
    navigation.push( "TaxonDetails", navParams );
  };

  const handleSaveOrDiscardPress = async ( action: MatchButtonAction ) => {
    if ( action === "save" ) {
      updateObservationKeys( {
        taxon: taxon || iconicTaxon,
        owners_identification_from_vision: true,
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
          taxonToSave={taxon}
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
          },
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
