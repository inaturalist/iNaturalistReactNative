// @flow

import { ViewWrapper } from "components/SharedComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import { FlatList } from "react-native";
import { useTranslation } from "sharedHooks";

import useObservers from "./hooks/useObservers";
import Suggestion from "./Suggestion";
import SuggestionsEmpty from "./SuggestionsEmpty";
import SuggestionsFooter from "./SuggestionsFooter";
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

  const taxonIds = otherSuggestions?.map( s => s.taxon.id );
  const observers = useObservers( taxonIds );
  const showLocationButton = !usingOfflineSuggestions && !loading;

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

  const renderFooter = useCallback( ( ) => (
    <SuggestionsFooter
      debugData={debugData}
      observers={observers}
      reloadSuggestions={reloadSuggestions}
      showLocationButton={showLocationButton}
      showSuggestionsWithLocation={showSuggestionsWithLocation}
    />
  ), [
    debugData,
    observers,
    reloadSuggestions,
    showLocationButton,
    showSuggestionsWithLocation
  ] );

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
