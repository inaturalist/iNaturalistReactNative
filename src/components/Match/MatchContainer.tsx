import { useNavigation } from "@react-navigation/native";
import type { ApiPhoto, ApiSuggestion } from "api/types";
import { Body3, Heading4 } from "components/SharedComponents";
import { BottomInsetViewWrapper } from "components/SharedComponents/ViewWrapper";
import { View } from "components/styledComponents";
import orderBy from "lodash/orderBy";
import type {
  NoBottomTabStackScreenProps,
  SharedStackParamList,
  TabStackScreenProps,
} from "navigation/types";
import { RealmContext } from "providers/contexts";
import React, {
  useCallback,
  useEffect, useMemo, useRef, useState,
} from "react";
import type { ScrollView } from "react-native";
import Photo from "realmModels/Photo";
import type { RealmPhoto, RealmTaxon } from "realmModels/types";
import fetchPlaceName from "sharedHelpers/fetchPlaceName";
import saveObservation from "sharedHelpers/saveObservation";
import shouldFetchObservationLocation from "sharedHelpers/shouldFetchObservationLocation";
import {
  useExitObservationFlow, useLocationPermission,
} from "sharedHooks";
import useDebugMode from "sharedHooks/useDebugMode";
import useFeatureFlag from "sharedHooks/useFeatureFlag";
import useObservationLocation from "sharedHooks/useObservationLocation";
import useSuggestionsV2 from "sharedHooks/useSuggestions/useSuggestionsV2";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import { FIREBASE_TRACE_ATTRIBUTES, FIREBASE_TRACES } from "stores/createFirebaseTraceSlice";
import useStore from "stores/useStore";

import tryToReplaceWithLocalTaxon from "./helpers/tryToReplaceWithLocalTaxon";
import Match from "./Match";
import PreMatchLoadingScreen from "./PreMatchLoadingScreen";

export type MatchButtonAction = "save" | "discard";

const { useRealm } = RealmContext;

const MatchContainer = ( ) => {
  const { isDebug } = useDebugMode( );
  const scrollRef = useRef<ScrollView>( null );
  const currentObservation = useStore( state => state.currentObservation );
  const getCurrentObservation = useStore( state => state.getCurrentObservation );
  const cameraRollUris = useStore( state => state.cameraRollUris );
  const updateObservationKeys = useStore( state => state.updateObservationKeys );
  const replacePhotoInObservation = useStore( state => state.replacePhotoInObservation );
  const photoEditingEnabled = useFeatureFlag( FeatureFlag.PhotoEditingEnabled );
  const navigation = useNavigation<
    NoBottomTabStackScreenProps<"Match">["navigation"] &
    TabStackScreenProps<"Match">["navigation"]
  >( );

  const {
    hasPermissions,
    renderPermissionsGate,
    requestPermissions,
  } = useLocationPermission( );

  const obsPhotos = currentObservation?.observationPhotos;

  const observationPhoto = obsPhotos?.[0]?.photo?.url
    || obsPhotos?.[0]?.photo?.localFilePath;
  // While the first photo has edits waiting for the media viewer to close,
  // keep identifying the photo as it was, so suggestions don't change behind
  // the viewer. Closing the viewer identifies the edited photo
  const [photoBeforeEdits, setPhotoBeforeEdits] = useState<string>( );
  const photoToIdentify = photoBeforeEdits || observationPhoto;

  const realm = useRealm( );
  const exitObservationFlow = useExitObservationFlow( {
    skipStoreReset: true,
  } );

  const evidenceHasLocation = !!currentObservation?.latitude;

  const [iconicTaxon, setIconicTaxon] = useState<RealmTaxon>( );
  const [currentUserLocation, setCurrentUserLocation] = useState<{
    latitude?: number;
    longitude?: number;
  } | null>( null );

  const stopFirebaseTrace = useStore( state => state.stopFirebaseTrace );

  // Read once, then replaced by the first GPS fix, so later fixes don't each
  // ask the AI again
  const [suggestionLocation, setSuggestionLocation] = useState( ( ) => (
    evidenceHasLocation
      ? { latitude: currentObservation?.latitude, longitude: currentObservation?.longitude }
      : null
  ) );

  // Wait until we know about location permission so we don't ask without
  // location and then again with it
  const permissionsKnown = hasPermissions !== undefined;

  const {
    suggestions,
    isLoading,
    onlineStatus,
    offlineStatus,
    onlineError,
    offlineError,
    usingOfflineSuggestions,
  } = useSuggestionsV2( {
    photoUri: photoToIdentify,
    location: suggestionLocation,
    enabled: permissionsKnown,
    observationUuid: currentObservation?.uuid,
  } );

  const [hasRefetchedSuggestions, setHasRefetchedSuggestions] = useState( false );
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<number | undefined>( undefined );

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
    () => shouldFetchObservationLocation( currentObservation ),
  );
  const shouldFetchLocation = !!( hasPermissions && needLocation );

  const {
    isFetchingLocation,
    userLocation,
  } = useObservationLocation( { shouldFetchLocation } );

  const navToLocationPicker = useCallback( ( ) => {
    navigation.navigate( "LocationPicker" );
  }, [navigation] );

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

  useEffect( () => {
    if ( userLocation === currentUserLocation ) return;
    if ( !userLocation?.latitude ) return;

    setCurrentUserLocation( userLocation );
    updateObservationKeys( userLocation );

    getCurrentUserPlaceName();

    if ( !hasRefetchedSuggestions ) {
      setSuggestionLocation( {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      } );
      setHasRefetchedSuggestions( true );
      scrollToTop( );
    }
  }, [
    userLocation,
    currentUserLocation,
    hasRefetchedSuggestions,
    updateObservationKeys,
    getCurrentUserPlaceName,
    scrollToTop,
  ] );

  const onSuggestionChosen = useCallback( ( selection: ApiSuggestion ) => {
    setSelectedSuggestionId( selection.taxon.id );
    scrollToTop( );
  }, [scrollToTop] );

  // Edited copies replace the originals in the observation. Only the first
  // photo is identified, so only its edits need new suggestions
  const editPhotoInViewer = useCallback( ( uri: string, newLocalFilePath: string ) => {
    const firstPhotoUri = Photo.getLocalPhotoUri( obsPhotos?.[0]?.photo?.localFilePath );
    if ( uri === firstPhotoUri ) {
      setPhotoBeforeEdits( photo => photo || observationPhoto );
    }
    replacePhotoInObservation( uri, newLocalFilePath );
  }, [obsPhotos, observationPhoto, replacePhotoInObservation] );

  const identifyEditedPhoto = useCallback( ( ) => {
    if ( !photoBeforeEdits ) return;
    setPhotoBeforeEdits( undefined );
    // The chosen suggestion was for the photo before it was edited
    setSelectedSuggestionId( undefined );
  }, [photoBeforeEdits] );

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

  const suggestionsLoading = !permissionsKnown || isLoading;
  // Settled, whether online, on-device, or neither, including when the device
  // was offline from the start or the connection dropped mid-request
  const suggestionsSettled = !suggestionsLoading && onlineStatus !== "idle";
  const answeredOnline = onlineStatus === "fetched";

  useEffect( ( ) => {
    if ( suggestionsSettled ) {
      stopFirebaseTrace(
        FIREBASE_TRACES.AI_CAMERA_TO_MATCH,
        { [FIREBASE_TRACE_ATTRIBUTES.ONLINE]: `${answeredOnline}` },
      );
    }
  }, [
    suggestionsSettled,
    answeredOnline,
    stopFirebaseTrace,
  ] );

  // Remove the top suggestion from the list of other suggestions
  const otherSuggestions = orderedSuggestions
    .filter( suggestion => suggestion.taxon.id !== taxonId );

  const navToTaxonDetails
  = ( photo?: ApiPhoto | RealmPhoto ) => {
    const navParams: SharedStackParamList["TaxonDetails"] = { id: taxonId };
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
        owners_identification_from_vision: !!taxon,
      } );
      await saveObservation( getCurrentObservation( ), cameraRollUris, realm );
    }
    exitObservationFlow( );
  };

  const taxonIds = otherSuggestions?.map( suggestion => suggestion.taxon.id );
  const localTaxa = realm.objects( "Taxon" ).filtered( "id IN $0", taxonIds );

  // show local taxon photos in additional suggestions list if they're available
  const suggestionsWithLocalTaxonPhotos = otherSuggestions
    .map( suggestion => tryToReplaceWithLocalTaxon( localTaxa, suggestion ) );

  return (
    <>
      <BottomInsetViewWrapper>
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
          onEditPhoto={photoEditingEnabled
            ? editPhotoInViewer
            : undefined}
          onMediaViewerClosed={identifyEditedPhoto}
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
              Online status:
              {JSON.stringify( onlineStatus )}
            </Body3>
            <Body3 className="text-white">
              Offline status:
              {JSON.stringify( offlineStatus )}
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
              Online error:
              {JSON.stringify( onlineError?.message )}
            </Body3>
            <Body3 className="text-white">
              Offline error:
              {JSON.stringify( offlineError?.message )}
            </Body3>
          </View>
        )}
      </BottomInsetViewWrapper>
      <PreMatchLoadingScreen isLoading={suggestionsLoading} />
    </>
  );
};

export default MatchContainer;
