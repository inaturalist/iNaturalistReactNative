// @flow

import { useNavigation } from "@react-navigation/native";
import {
  Body1,
  Body3,
  Button,
  Heading4,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import { FlatList } from "react-native";
import { formatISONoTimezone } from "sharedHelpers/dateAndTime";
import { useDebugMode, useTranslation } from "sharedHooks";

import Attribution from "./Attribution";
import useObservers from "./hooks/useObservers";
import Suggestion from "./Suggestion";
import SuggestionsEmpty from "./SuggestionsEmpty";
import SuggestionsHeader from "./SuggestionsHeader";

type Props = {
  debugData: Object,
  loading: boolean,
  onPressPhoto: Function,
  onTaxonChosen: Function,
  otherSuggestions: Array<Object>,
  photoUris: Array<string>,
  reloadSuggestions: Function,
  selectedPhotoUri: string,
  setLocationPermissionNeeded: Function,
  showImproveWithLocationButton: boolean,
  showSuggestionsWithLocation: boolean,
  topSuggestion: Object,
  usingOfflineSuggestions: boolean,
};

const Suggestions = ( {
  debugData,
  loading,
  onPressPhoto,
  onTaxonChosen,
  otherSuggestions,
  photoUris,
  reloadSuggestions,
  selectedPhotoUri,
  setLocationPermissionNeeded,
  showImproveWithLocationButton,
  showSuggestionsWithLocation,
  topSuggestion,
  usingOfflineSuggestions
}: Props ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const { isDebug } = useDebugMode( );

  const taxonIds = otherSuggestions?.map( s => s.taxon.id );
  const observers = useObservers( taxonIds );

  const navToObsEdit = useCallback( ( ) => navigation.navigate( "ObsEdit", {
    lastScreen: "Suggestions"
  } ), [navigation] );

  const renderSuggestion = useCallback( ( { item: suggestion } ) => (
    <Suggestion
      accessibilityLabel={t( "Choose-taxon" )}
      fetchRemote={!usingOfflineSuggestions}
      suggestion={suggestion}
      onTaxonChosen={onTaxonChosen}
    />
  ), [onTaxonChosen, t, usingOfflineSuggestions] );

  const renderEmptyList = useCallback( ( ) => (
    <SuggestionsEmpty loading={loading} hasTopSuggestion={!!topSuggestion} />
  ), [loading, topSuggestion] );

  /* eslint-disable i18next/no-literal-string */
  /* eslint-disable react/jsx-one-expression-per-line */
  /* eslint-disable max-len */
  const renderFooter = useCallback( ( ) => (
    <>
      {showSuggestionsWithLocation
        ? (
          <View className="px-4 py-6">
            <Button
              text={t( "IGNORE-LOCATION" )}
              onPress={( ) => reloadSuggestions( { showLocation: false } )}
              accessibilityLabel={t( "Search-suggestions-without-location" )}
            />
          </View>
        )
        : (
          <View className="px-4 py-6">
            <Button
              text={t( "USE-LOCATION" )}
              onPress={( ) => reloadSuggestions( { showLocation: true } )}
              accessibilityLabel={t( "Search-suggestions-with-location" )}
            />
          </View>
        )}
      <Attribution observers={observers} />
      <Body1
        className="underline text-center py-6"
        onPress={navToObsEdit}
        accessibilityRole="link"
        accessibilityHint={t( "Navigates-to-observation-edit-screen" )}
      >
        {t( "Add-an-ID-Later" )}
      </Body1>
      { isDebug && (
        <View className="bg-deeppink text-white p-3">
          <Heading4 className="text-white">Diagnostics</Heading4>
          <Body3 className="text-white">Online suggestions URI: {JSON.stringify( debugData?.selectedPhotoUri )}</Body3>
          <Body3 className="text-white">Online suggestions updated at: {formatISONoTimezone( debugData?.onlineSuggestionsUpdatedAt )}</Body3>
          <Body3 className="text-white">Online suggestions timed out: {JSON.stringify( debugData?.timedOut )}</Body3>
          <Body3 className="text-white">Online suggestions using location: {JSON.stringify( debugData?.showSuggestionsWithLocation )}</Body3>
          <Body3 className="text-white">Num online suggestions: {JSON.stringify( debugData?.onlineSuggestions?.results.length )}</Body3>
          <Body3 className="text-white">Num offline suggestions: {JSON.stringify( debugData?.offlineSuggestions?.length )}</Body3>
          <Body3 className="text-white">Error loading online: {JSON.stringify( debugData?.onlineSuggestionsError )}</Body3>
        </View>
      )}
    </>
  ), [
    debugData,
    isDebug,
    showSuggestionsWithLocation,
    navToObsEdit,
    observers,
    reloadSuggestions,
    t
  ] );
  /* eslint-enable i18next/no-literal-string */
  /* eslint-enable react/jsx-one-expression-per-line */
  /* eslint-enable max-len */

  const renderHeader = useCallback( ( ) => (
    <SuggestionsHeader
      loading={loading}
      onPressPhoto={onPressPhoto}
      otherSuggestions={otherSuggestions}
      photoUris={photoUris}
      reloadSuggestions={reloadSuggestions}
      renderSuggestion={renderSuggestion}
      selectedPhotoUri={selectedPhotoUri}
      setLocationPermissionNeeded={setLocationPermissionNeeded}
      showImproveWithLocationButton={showImproveWithLocationButton}
      showSuggestionsWithLocation={showSuggestionsWithLocation}
      topSuggestion={topSuggestion}
      usingOfflineSuggestions={usingOfflineSuggestions}
    />
  ), [
    loading,
    onPressPhoto,
    otherSuggestions,
    photoUris,
    reloadSuggestions,
    renderSuggestion,
    selectedPhotoUri,
    setLocationPermissionNeeded,
    showImproveWithLocationButton,
    showSuggestionsWithLocation,
    topSuggestion,
    usingOfflineSuggestions
  ] );

  return (
    <ViewWrapper testID="suggestions">
      <FlatList
        testID="Suggestions.FlatList"
        data={otherSuggestions}
        renderItem={renderSuggestion}
        ListEmptyComponent={renderEmptyList}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={renderHeader}
      />
    </ViewWrapper>
  );
};

export default Suggestions;
