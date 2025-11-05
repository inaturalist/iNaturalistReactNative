// @flow

import {
  Body1,
  Heading4,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback, useMemo } from "react";
import { SectionList } from "react-native";
import { useTranslation } from "sharedHooks";

import useObservers from "./hooks/useObservers";
import Suggestion from "./Suggestion";
import SuggestionsEmpty from "./SuggestionsEmpty";
import SuggestionsFooter from "./SuggestionsFooter";
import SuggestionsHeader from "./SuggestionsHeader";

type Props = {
  debugData: Object,
  handleSkip: Function,
  hideLocationToggleButton: boolean,
  hideSkip?: boolean,
  improveWithLocationButtonOnPress: () => void,
  isLoading: boolean,
  shouldUseEvidenceLocation: boolean,
  onPressPhoto: Function,
  onTaxonChosen: Function,
  photoUris: Array<string>,
  reloadSuggestions: Function,
  selectedPhotoUri: string,
  showImproveWithLocationButton: boolean,
  suggestions: Object,
  toggleLocation: Function,
  urlWillCrashOffline: boolean,
  usingOfflineSuggestions: boolean
};

const Suggestions = ( {
  debugData,
  handleSkip,
  hideLocationToggleButton,
  hideSkip,
  improveWithLocationButtonOnPress,
  isLoading,
  shouldUseEvidenceLocation,
  onPressPhoto,
  onTaxonChosen,
  photoUris,
  reloadSuggestions,
  selectedPhotoUri,
  showImproveWithLocationButton,
  suggestions,
  toggleLocation,
  urlWillCrashOffline,
  usingOfflineSuggestions
}: Props ): Node => {
  const { t } = useTranslation( );
  const {
    otherSuggestions,
    topSuggestion
  } = suggestions;

  const taxonIds = otherSuggestions?.map( s => s.taxon.id );
  const observers = useObservers( taxonIds );
  const isEmptyList = !topSuggestion && otherSuggestions?.length === 0;
  const showOfflineText = !isLoading && usingOfflineSuggestions && !isEmptyList;

  const renderSuggestion = useCallback( ( { item: suggestion } ) => (
    <Suggestion
      accessibilityLabel={t( "Choose-taxon" )}
      suggestion={suggestion}
      onTaxonChosen={onTaxonChosen}
    />
  ), [onTaxonChosen, t] );

  const renderEmptyList = useMemo( ( ) => (
    <SuggestionsEmpty
      hasTopSuggestion={!!topSuggestion}
      isLoading={isLoading}
      onTaxonChosen={onTaxonChosen}
      reloadSuggestions={reloadSuggestions}
      urlWillCrashOffline={urlWillCrashOffline}
    />
  ), [isLoading, topSuggestion, onTaxonChosen, urlWillCrashOffline, reloadSuggestions] );

  const renderFooter = useMemo( ( ) => (
    <SuggestionsFooter
      debugData={debugData}
      handleSkip={handleSkip}
      hideLocationToggleButton={hideLocationToggleButton}
      hideSkip={hideSkip}
      shouldUseEvidenceLocation={shouldUseEvidenceLocation}
      observers={observers}
      toggleLocation={toggleLocation}
    />
  ), [
    debugData,
    handleSkip,
    hideLocationToggleButton,
    hideSkip,
    shouldUseEvidenceLocation,
    observers,
    toggleLocation
  ] );

  const renderHeader = useMemo( ( ) => (
    <SuggestionsHeader
      onPressPhoto={onPressPhoto}
      photoUris={photoUris}
      reloadSuggestions={reloadSuggestions}
      selectedPhotoUri={selectedPhotoUri}
      showOfflineText={showOfflineText}
      improveWithLocationButtonOnPress={improveWithLocationButtonOnPress}
      showImproveWithLocationButton={showImproveWithLocationButton}
    />
  ), [
    onPressPhoto,
    photoUris,
    reloadSuggestions,
    selectedPhotoUri,
    improveWithLocationButtonOnPress,
    showImproveWithLocationButton,
    showOfflineText
  ] );

  const renderSectionHeader = ( { section } ) => {
    if ( section?.data.length === 0 || isLoading ) {
      return null;
    }
    return (
      <Heading4 className="mt-6 mb-4 ml-4 bg-white">{section?.title}</Heading4>
    );
  };

  const renderTopSuggestion = ( { item } ) => {
    if ( isLoading ) { return null; }
    if ( !item ) {
      return (
        <Body1 className="mx-2 p-4 text-center text-xl">
          {t( "We-are-not-confident-enough-to-make-a-top-ID-suggestion" )}
        </Body1>
      );
    }
    return (
      <View className="bg-inatGreen/[.13]">
        <Suggestion
          accessibilityLabel={t( "Choose-top-taxon" )}
          suggestion={item}
          isTopSuggestion
          onTaxonChosen={onTaxonChosen}
        />
      </View>
    );
  };

  const createSections = ( ) => {
    if ( isLoading ) {
      return [];
    }
    if ( isEmptyList ) {
      return [];
    }
    return [{
      title: t( "TOP-ID-SUGGESTION" ),
      // If there is a top suggestion we want to show it, but if there isn't
      // we will still show the section with a notice saying there's nothing
      // to show, so data can't be empty
      data: [topSuggestion || null],
      renderItem: renderTopSuggestion
    }, {
      title: t( "OTHER-SUGGESTIONS" ),
      data: otherSuggestions
    }];
  };

  const sections = createSections( );

  return (
    <ViewWrapper testID="suggestions" useTopInset={false}>
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
