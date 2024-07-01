// @flow

import {
  Body1,
  Heading4,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import { SectionList } from "react-native";
import { useTranslation } from "sharedHooks";

import useObservers from "./hooks/useObservers";
import Suggestion from "./Suggestion";
import SuggestionsEmpty from "./SuggestionsEmpty";
import SuggestionsFooter from "./SuggestionsFooter";
import SuggestionsHeader from "./SuggestionsHeader";

type Props = {
  debugData: Object,
  onPressPhoto: Function,
  onTaxonChosen: Function,
  photoUris: Array<string>,
  reloadSuggestions: Function,
  selectedPhotoUri: string,
  // setLocationPermissionNeeded: Function,
  // showImproveWithLocationButton: boolean,
  showSuggestionsWithLocation: boolean,
  suggestions: Object
};

const Suggestions = ( {
  debugData,
  onPressPhoto,
  onTaxonChosen,
  photoUris,
  reloadSuggestions,
  selectedPhotoUri,
  // setLocationPermissionNeeded,
  // showImproveWithLocationButton,
  showSuggestionsWithLocation,
  suggestions
}: Props ): Node => {
  const { t } = useTranslation( );
  const loading = suggestions?.isLoading;
  const { usingOfflineSuggestions, topSuggestion, otherSuggestions } = suggestions;

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
      photoUris={photoUris}
      reloadSuggestions={reloadSuggestions}
      selectedPhotoUri={selectedPhotoUri}
      // setLocationPermissionNeeded={setLocationPermissionNeeded}
      // showImproveWithLocationButton={showImproveWithLocationButton}
      showSuggestionsWithLocation={showSuggestionsWithLocation}
      usingOfflineSuggestions={usingOfflineSuggestions}
    />
  ), [
    loading,
    onPressPhoto,
    photoUris,
    reloadSuggestions,
    selectedPhotoUri,
    // setLocationPermissionNeeded,
    // showImproveWithLocationButton,
    showSuggestionsWithLocation,
    usingOfflineSuggestions
  ] );

  const renderSectionHeader = ( { section } ) => {
    if ( section?.data.length === 0 || loading ) {
      return null;
    }
    return (
      <Heading4 className="mt-6 mb-4 ml-4 bg-white">{section?.title}</Heading4>
    );
  };

  const renderTopSuggestion = ( { item } ) => {
    if ( loading ) { return null; }
    if ( !item && !usingOfflineSuggestions ) {
      return (
        <Body1 className="mx-2">
          {t( "We-are-not-confident-enough-to-make-a-top-ID-suggestion" )}
        </Body1>
      );
    }
    if ( !item ) {
      return null;
    }
    return (
      <View className="bg-inatGreen/[.13]">
        {renderSuggestion( { item } )}
      </View>
    );
  };

  const createSections = ( ) => {
    if ( loading ) {
      return [];
    }
    if ( !topSuggestion && otherSuggestions?.length === 0 ) {
      return [];
    }
    return [{
      title: t( "TOP-ID-SUGGESTION" ),
      data: topSuggestion
        ? [topSuggestion]
        : [],
      renderItem: renderTopSuggestion
    }, {
      title: t( "OTHER-SUGGESTIONS" ),
      data: otherSuggestions
    }];
  };

  const sections = createSections( );

  return (
    <ViewWrapper testID="suggestions">
      <SectionList
        ListEmptyComponent={renderEmptyList}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={renderHeader}
        renderItem={renderSuggestion}
        renderSectionHeader={renderSectionHeader}
        sections={sections}
        stickySectionHeadersEnabled={false}
        testID="Suggestions.SectionList"
      />
    </ViewWrapper>
  );
};

export default Suggestions;
