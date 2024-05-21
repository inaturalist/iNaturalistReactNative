// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Body3,
  Button,
  Heading4,
  ViewWrapper
} from "components/SharedComponents";
import {
  View
} from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import { FlatList } from "react-native";
import { formatISONoTimezone } from "sharedHelpers/dateAndTime";
import { useDebugMode, useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

import AddCommentPrompt from "./AddCommentPrompt";
import Attribution from "./Attribution";
import CommentBox from "./CommentBox";
import useObservers from "./hooks/useObservers";
import ObsPhotoSelectionList from "./ObsPhotoSelectionList";
import Suggestion from "./Suggestion";
import SuggestionsEmpty from "./SuggestionsEmpty";

type Props = {
  commonAncestor: ?Object,
  debugData: Object,
  hasVisionSuggestion: boolean,
  loading: boolean,
  onPressPhoto: Function,
  onTaxonChosen: Function,
  photoUris: Array<string>,
  selectedPhotoUri: string,
  suggestions: Array<Object>,
  usingOfflineSuggestions: boolean,
};

const Suggestions = ( {
  commonAncestor,
  debugData,
  hasVisionSuggestion,
  loading,
  onPressPhoto,
  onTaxonChosen,
  photoUris,
  selectedPhotoUri,
  suggestions: unfilteredSuggestions,
  usingOfflineSuggestions
}: Props ): Node => {
  const currentObservation = useStore( state => state.currentObservation );

  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { lastScreen } = params;
  const { isDebug } = useDebugMode( );

  const hideVisionResultFromAllSuggestions = list => {
    if ( !hasVisionSuggestion ) { return list; }
    return list.filter(
      result => result?.taxon?.id !== currentObservation?.taxon?.id
    ).map( r => r );
  };

  const suggestions = hideVisionResultFromAllSuggestions( unfilteredSuggestions );

  const topSuggestion = hasVisionSuggestion
    ? currentObservation
    : commonAncestor;

  const taxonIds = suggestions?.map(
    suggestion => suggestion.taxon.id
  );

  const observers = useObservers( taxonIds );

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
      <Attribution observers={observers} />
      { isDebug && (
        <View className="bg-deeppink text-white p-3">
          <Heading4 className="text-white">Diagnostics</Heading4>
          <Body3 className="text-white">Online suggestions URI: {JSON.stringify( debugData?.selectedPhotoUri )}</Body3>
          <Body3 className="text-white">Online suggestions updated at: {formatISONoTimezone( debugData?.onlineSuggestionsUpdatedAt )}</Body3>
          <Body3 className="text-white">Online suggestions timed out: {JSON.stringify( debugData?.timedOut )}</Body3>
          <Body3 className="text-white">Num online suggestions: {JSON.stringify( debugData?.onlineSuggestions?.results.length )}</Body3>
          <Body3 className="text-white">Num offline suggestions: {JSON.stringify( debugData?.offlineSuggestions?.length )}</Body3>
          <Body3 className="text-white">Error loading online: {JSON.stringify( debugData?.onlineSuggestionsError )}</Body3>
        </View>
      )}
    </>
  ), [debugData, isDebug, observers] );
  /* eslint-enable i18next/no-literal-string */
  /* eslint-enable react/jsx-one-expression-per-line */
  /* eslint-enable max-len */

  const renderHeader = useCallback( ( ) => (
    <>
      <AddCommentPrompt />
      <View className="mx-5">
        <ObsPhotoSelectionList
          photoUris={photoUris}
          selectedPhotoUri={selectedPhotoUri}
          onPressPhoto={onPressPhoto}
        />
        <Body3 className="my-4 mx-3">{t( "Select-the-identification-you-want-to-add" )}</Body3>
        <Button
          text={t( "SEARCH-FOR-A-TAXON" )}
          onPress={( ) => navigation.navigate( "TaxonSearch", { lastScreen } )}
          accessibilityLabel={t( "Search" )}
        />
      </View>
      { usingOfflineSuggestions && (
        <View className="bg-warningYellow px-8 py-5 mt-5">
          <Heading4>{ t( "Viewing-Offline-Suggestions" ) }</Heading4>
          <Body3>{ t( "Viewing-Offline-Suggestions-results-may-differ" ) }</Body3>
        </View>
      ) }
      { topSuggestion && (
        <>
          <Heading4 className="mt-6 mb-4 ml-4">{t( "TOP-ID-SUGGESTION" )}</Heading4>
          <View className="bg-inatGreen/[.13]">
            {renderSuggestion( { item: topSuggestion } )}
          </View>
        </>
      ) }
      { suggestions?.length > 0 && (
        <Heading4 className="mt-6 mb-4 ml-4">
          {
            suggestions[0]?.score
              ? t( "ALL-SUGGESTIONS" )
              : t( "NEARBY-SUGGESTIONS" )
          }
        </Heading4>
      ) }
      <CommentBox />
    </>
  ), [
    lastScreen,
    navigation,
    onPressPhoto,
    photoUris,
    renderSuggestion,
    selectedPhotoUri,
    suggestions,
    t,
    topSuggestion,
    usingOfflineSuggestions
  ] );

  return (
    <ViewWrapper testID="suggestions">
      <FlatList
        data={suggestions}
        renderItem={renderSuggestion}
        ListEmptyComponent={renderEmptyList}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={renderHeader}
      />
    </ViewWrapper>
  );
};

export default Suggestions;
