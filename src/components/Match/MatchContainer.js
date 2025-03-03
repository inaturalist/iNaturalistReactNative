import { useNavigation } from "@react-navigation/native";
import { Body3, Heading4, ViewWrapper } from "components/SharedComponents";
import { View } from "components/styledComponents";
import _ from "lodash";
import { RealmContext } from "providers/contexts.ts";
import React, {
  useCallback,
  useMemo,
  useRef
} from "react";
import saveObservation from "sharedHelpers/saveObservation.ts";
import {
  reorderSuggestionsAfterNewSelection
} from "sharedHelpers/sortSuggestionsForMatch.ts";
import {
  useExitObservationFlow,
  useLocationPermission,
  useSuggestionsForMatch
} from "sharedHooks";
import { isDebugMode } from "sharedHooks/useDebugMode";
import useStore from "stores/useStore";

import Match from "./Match";
import PreMatchLoadingScreen from "./PreMatchLoadingScreen";

const { useRealm } = RealmContext;

const MatchContainer = ( ) => {
  const isDebug = isDebugMode( );
  const scrollRef = useRef( null );
  const currentObservation = useStore( state => state.currentObservation );
  const getCurrentObservation = useStore( state => state.getCurrentObservation );
  const cameraRollUris = useStore( state => state.cameraRollUris );
  const setTopAndOtherSuggestions = useStore( state => state.setTopAndOtherSuggestions );
  const topSuggestion = useStore( state => state.topSuggestion );
  const otherSuggestions = useStore( state => state.otherSuggestions );
  const suggestionsList = useStore( state => state.suggestionsList );
  const setSuggestionsList = useStore( state => state.setSuggestionsList );
  const onlineSuggestions = useStore( state => state.onlineSuggestions );
  const offlineSuggestions = useStore( state => state.offlineSuggestions );
  const shouldUseLocation = useStore( state => state.shouldUseLocation );
  const isLoading = useStore( state => state.isLoading );

  const updateObservationKeys = useStore( state => state.updateObservationKeys );
  // const setShouldUseLocation = useStore( state => state.setShouldUseLocation );
  const navigation = useNavigation( );
  const { hasPermissions, renderPermissionsGate, requestPermissions } = useLocationPermission( );

  useSuggestionsForMatch( );

  const obsPhotos = currentObservation?.observationPhotos;

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

  const scrollToTop = useCallback( ( ) => {
    if ( scrollRef.current ) {
      scrollRef.current.scrollTo( { y: 0, animated: true } );
    }
  }, [] );

  const onSuggestionChosen = useCallback( selection => {
    const reorderedSuggestions = reorderSuggestionsAfterNewSelection( selection, suggestionsList );
    const {
      topSuggestion: newTopSuggestion,
      otherSuggestions: newOtherSuggestions
    } = reorderedSuggestions;
    setTopAndOtherSuggestions( newTopSuggestion, newOtherSuggestions );
    setSuggestionsList( reorderedSuggestions );
    scrollToTop( );
  }, [
    suggestionsList,
    scrollToTop,
    setTopAndOtherSuggestions,
    setSuggestionsList
  ] );

  const taxon = topSuggestion?.taxon;
  const taxonId = taxon?.id;

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

  const suggestionsLoading = useMemo( () => (
    ( !offlineSuggestions || offlineSuggestions.length === 0 )
      && ( !onlineSuggestions || onlineSuggestions.length === 0 )
  ), [offlineSuggestions, onlineSuggestions] );

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
          topSuggestion={topSuggestion}
          otherSuggestions={otherSuggestions}
          suggestionsLoading={suggestionsLoading}
          scrollRef={scrollRef}
        />
        {renderPermissionsGate( { onPermissionGranted: openLocationPicker } )}
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
            <Body3 className="text-white">
              Should use location:
              {JSON.stringify( shouldUseLocation )}
            </Body3>
          </View>
        )}
      </ViewWrapper>
      {isLoading && <PreMatchLoadingScreen />}
    </>
  );
};

export default MatchContainer;
