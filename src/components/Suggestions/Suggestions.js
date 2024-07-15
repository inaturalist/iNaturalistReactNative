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
  hideSkip?: boolean,
  onPressPhoto: Function,
  onTaxonChosen: Function,
  photoUris: Array<string>,
  reloadSuggestions: Function,
  selectedPhotoUri: string,
  improveWithLocationButtonOnPress: () => void;
  showImproveWithLocationButton: boolean;
  suggestions: Object
};

const Suggestions = ( {
  debugData,
  hideSkip,
  onPressPhoto,
  onTaxonChosen,
  photoUris,
  reloadSuggestions,
  selectedPhotoUri,
  improveWithLocationButtonOnPress,
  showImproveWithLocationButton,
  suggestions
}: Props ): Node => {
  const { t } = useTranslation( );
  const {
    isLoading,
    otherSuggestions,
    topSuggestion,
    usingOfflineSuggestions
  } = suggestions;

  const taxonIds = otherSuggestions?.map( s => s.taxon.id );
  const observers = useObservers( taxonIds );
  const isEmptyList = !topSuggestion && otherSuggestions?.length === 0;

  const renderSuggestion = useCallback( ( { item: suggestion } ) => (
    <Suggestion
      accessibilityLabel={t( "Choose-taxon" )}
      fetchRemote={!usingOfflineSuggestions}
      suggestion={suggestion}
      onTaxonChosen={onTaxonChosen}
    />
  ), [onTaxonChosen, t, usingOfflineSuggestions] );

  const renderEmptyList = useCallback( ( ) => (
    <SuggestionsEmpty isLoading={isLoading} hasTopSuggestion={!!topSuggestion} />
  ), [isLoading, topSuggestion] );

  const renderFooter = useCallback( ( ) => (
    <SuggestionsFooter
      debugData={debugData}
      hideSkip={hideSkip}
      isLoading={suggestions.isLoading}
      observers={observers}
      reloadSuggestions={reloadSuggestions}
      showSuggestionsWithLocation={suggestions.showSuggestionsWithLocation}
      usingOfflineSuggestions={suggestions.usingOfflineSuggestions}
    />
  ), [
    debugData,
    hideSkip,
    observers,
    reloadSuggestions,
    suggestions
  ] );

  const renderHeader = useCallback( ( ) => (
    <SuggestionsHeader
      onPressPhoto={onPressPhoto}
      photoUris={photoUris}
      reloadSuggestions={reloadSuggestions}
      selectedPhotoUri={selectedPhotoUri}
      suggestions={suggestions}
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
    suggestions
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
    if ( isLoading ) {
      return [];
    }
    if ( isEmptyList ) {
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
