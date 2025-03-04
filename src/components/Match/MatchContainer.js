import { useNavigation } from "@react-navigation/native";
import { Body3, Heading4, ViewWrapper } from "components/SharedComponents";
import { View } from "components/styledComponents";
import _ from "lodash";
import { RealmContext } from "providers/contexts.ts";
import React, {
  useCallback,
  useRef
} from "react";
import fetchPlaceName from "sharedHelpers/fetchPlaceName";
import saveObservation from "sharedHelpers/saveObservation.ts";
import {
  convertSuggestionsObjToList,
  reorderSuggestionsAfterNewSelection
} from "sharedHelpers/sortSuggestionsForMatch.ts";
import {
  useExitObservationFlow,
  useLocationPermission,
  useSuggestionsForMatch
} from "sharedHooks";
import { isDebugMode } from "sharedHooks/useDebugMode";
import useStore from "stores/useStore";

import fetchUserLocation from "../../sharedHelpers/fetchUserLocation";
import Match from "./Match";
import PreMatchLoadingScreen from "./PreMatchLoadingScreen";

const { useRealm } = RealmContext;

const MatchContainer = ( ) => {
  const resetSuggestionsSlice = useStore( state => state.resetSuggestionsSlice );
  const isDebug = isDebugMode( );
  const scrollRef = useRef( null );
  const currentObservation = useStore( state => state.currentObservation );
  const getCurrentObservation = useStore( state => state.getCurrentObservation );
  const cameraRollUris = useStore( state => state.cameraRollUris );
  const suggestionsList = useStore( state => state.suggestionsList );
  const setSuggestionsList = useStore( state => state.setSuggestionsList );
  // NOTE: onlineSuggestions and offlineSuggestions are not used in this component
  // except for debugging purposes. suggestionsList is the source of truth for suggestions
  // this can be refactored at some point into something like a debugInfo object
  // but might be time consuming because of the way zustand handles nested objects
  const onlineSuggestions = useStore( state => state.onlineSuggestions );
  const offlineSuggestions = useStore( state => state.offlineSuggestions );
  const isLoading = useStore( state => state.isLoading );

  const updateObservationKeys = useStore( state => state.updateObservationKeys );
  const navigation = useNavigation( );
  const {
    hasPermissions, renderPermissionsGate, requestPermissions
  } = useLocationPermission( );

  useSuggestionsForMatch( );

  const getCurrentUserLocation = useCallback( async ( ) => {
    const currentUserLocation = await fetchUserLocation( );
    const placeGuess
     = await fetchPlaceName( currentUserLocation?.latitude, currentUserLocation?.longitude );

    resetSuggestionsSlice( );

    updateObservationKeys( {
      latitude: currentUserLocation?.latitude,
      longitude: currentUserLocation?.longitude,
      place_guess: placeGuess
    } );
  }, [updateObservationKeys, resetSuggestionsSlice] );

  const obsPhotos = currentObservation?.observationPhotos;

  const realm = useRealm( );

  const exitObservationFlow = useExitObservationFlow( {
    skipStoreReset: true
  } );

  const handleLocationPickerPressed = useCallback( ( ) => {
    if ( hasPermissions ) {
      getCurrentUserLocation( );
    } else {
      requestPermissions( );
    }
  }, [hasPermissions, getCurrentUserLocation, requestPermissions] );

  const scrollToTop = useCallback( ( ) => {
    if ( scrollRef.current ) {
      scrollRef.current.scrollTo( { y: 0, animated: true } );
    }
  }, [] );

  const onSuggestionChosen = useCallback( selection => {
    const reorderedSuggestions = reorderSuggestionsAfterNewSelection( selection, suggestionsList );
    const newSuggestionsList = convertSuggestionsObjToList( reorderedSuggestions );
    setSuggestionsList( newSuggestionsList );
    scrollToTop( );
  }, [
    suggestionsList,
    scrollToTop,
    setSuggestionsList
  ] );

  const taxon = suggestionsList?.[0]?.taxon;
  const taxonId = taxon?.id;

  const navToTaxonDetails = useCallback( photo => {
    const params = { id: taxonId };
    if ( !photo?.isRepresentativeButOtherTaxon ) {
      params.firstPhotoID = photo.id;
    } else {
      params.representativePhoto = photo;
    }
    navigation.push( "TaxonDetails", params );
  }, [navigation, taxonId] );

  const handleSaveOrDiscardPress = useCallback( async action => {
    if ( action === "save" ) {
      updateObservationKeys( {
        taxon,
        owners_identification_from_vision: true
      } );
      await saveObservation( getCurrentObservation( ), cameraRollUris, realm );
    }
    exitObservationFlow( );
  }, [
    cameraRollUris,
    exitObservationFlow,
    getCurrentObservation,
    realm,
    taxon,
    updateObservationKeys
  ] );

  return (
    <>
      <ViewWrapper isDebug={isDebug}>
        <Match
          observation={currentObservation}
          obsPhotos={obsPhotos}
          onSuggestionChosen={onSuggestionChosen}
          handleSaveOrDiscardPress={handleSaveOrDiscardPress}
          navToTaxonDetails={navToTaxonDetails}
          handleLocationPickerPressed={handleLocationPickerPressed}
          scrollRef={scrollRef}
        />
        {renderPermissionsGate(
          {
            onPermissionGranted: getCurrentUserLocation
          },
          {
            closeOnInitialBlock: true
          }
        )}
        {/* eslint-disable i18next/no-literal-string */}
        {/* eslint-disable react/jsx-one-expression-per-line */}
        {/* eslint-disable max-len */}
        { isDebug && (
          <View className="bg-deeppink text-white p-3">
            <Heading4 className="text-white">Diagnostics</Heading4>
            <Body3 className="text-white">
              Online suggestions length:
              {JSON.stringify( onlineSuggestions.length )}
            </Body3>
            <Body3 className="text-white">
              Offline suggestions length:
              {JSON.stringify( offlineSuggestions.length )}
            </Body3>
          </View>
        )}
      </ViewWrapper>
      {isLoading && <PreMatchLoadingScreen />}
    </>
  );
};

export default MatchContainer;
