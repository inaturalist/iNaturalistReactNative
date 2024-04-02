// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ActivityIndicator,
  Body1,
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

type Props = {
  commonAncestor: ?string,
  hasVisionSuggestion: boolean,
  loadingSuggestions: boolean,
  suggestions: Array<Object>,
  onTaxonChosen: Function,
  photoUris: Array<string>,
  selectedPhotoUri: string,
  onPressPhoto: Function,
  usingOfflineSuggestions: boolean,
  debugData: any
};

const Suggestions = ( {
  commonAncestor,
  hasVisionSuggestion,
  loadingSuggestions,
  suggestions: unfilteredSuggestions,
  onTaxonChosen,
  photoUris,
  selectedPhotoUri,
  onPressPhoto,
  usingOfflineSuggestions,
  debugData
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

  const loading = loadingSuggestions && photoUris?.length > 0;

  const renderItem = useCallback( ( { item: suggestion } ) => (
    <Suggestion
      suggestion={suggestion}
      onTaxonChosen={onTaxonChosen}
    />
  ), [onTaxonChosen] );

  const renderEmptyList = useCallback( ( ) => {
    if ( loading ) {
      return (
        <View className="justify-center items-center mt-5" testID="SuggestionsList.loading">
          <ActivityIndicator size={50} />
        </View>
      );
    }

    if ( !suggestions || suggestions.length === 0 ) {
      return (
        <Body1 className="mt-10 px-10 text-center">
          {t( "iNaturalist-has-no-ID-suggestions-for-this-photo" )}
        </Body1>
      );
    }
    return null;
  }, [loading, suggestions, t] );

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
            <Suggestion
              suggestion={topSuggestion}
              onTaxonChosen={onTaxonChosen}
            />
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
    t,
    topSuggestion,
    photoUris,
    selectedPhotoUri,
    onPressPhoto,
    suggestions,
    onTaxonChosen,
    usingOfflineSuggestions
  ] );

  return (
    <ViewWrapper testID="suggestions">
      <FlatList
        data={suggestions}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyList}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={renderHeader}
      />
    </ViewWrapper>
  );
};

export default Suggestions;
