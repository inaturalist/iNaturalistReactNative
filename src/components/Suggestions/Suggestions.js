// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Body1,
  Body3,
  Heading4,
  INatIconButton,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback, useEffect } from "react";
import { FlatList } from "react-native";
import { formatISONoTimezone } from "sharedHelpers/dateAndTime";
import { useDebugMode, useTranslation } from "sharedHooks";

import AddCommentPrompt from "./AddCommentPrompt";
import Attribution from "./Attribution";
import CommentBox from "./CommentBox";
import useObservers from "./hooks/useObservers";
import ObsPhotoSelectionList from "./ObsPhotoSelectionList";
import Suggestion from "./Suggestion";
import SuggestionsEmpty from "./SuggestionsEmpty";

type Props = {
  debugData: Object,
  loading: boolean,
  onPressPhoto: Function,
  onTaxonChosen: Function,
  photoUris: Array<string>,
  selectedPhotoUri: string,
  otherSuggestions: Array<Object>,
  topSuggestion: Object,
  usingOfflineSuggestions: boolean,
};

const Suggestions = ( {
  debugData,
  loading,
  onPressPhoto,
  onTaxonChosen,
  photoUris,
  selectedPhotoUri,
  otherSuggestions,
  topSuggestion,
  usingOfflineSuggestions
}: Props ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { lastScreen } = params;
  const { isDebug } = useDebugMode( );

  const taxonIds = otherSuggestions?.map( s => s.taxon.id );

  const observers = useObservers( taxonIds );

  const hasOtherSuggestions = otherSuggestions?.length > 0;

  const headerRight = useCallback( ( ) => (
    <INatIconButton
      icon="magnifying-glass"
      onPress={( ) => navigation.navigate( "TaxonSearch", { lastScreen } )}
      accessibilityLabel={t( "Search" )}
    />
  ), [navigation, lastScreen, t] );

  useEffect( ( ) => {
    navigation.setOptions( { headerRight } );
  }, [headerRight, navigation] );

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
          <Body3 className="text-white">Num online suggestions: {JSON.stringify( debugData?.onlineSuggestions?.results.length )}</Body3>
          <Body3 className="text-white">Num offline suggestions: {JSON.stringify( debugData?.offlineSuggestions?.length )}</Body3>
          <Body3 className="text-white">Error loading online: {JSON.stringify( debugData?.onlineSuggestionsError )}</Body3>
        </View>
      )}
    </>
  ), [debugData, isDebug, navToObsEdit, observers, t] );
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
      </View>
      {!loading && (
        <>
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
          { hasOtherSuggestions && (
            <Heading4 className="mt-6 mb-4 ml-4">{t( "OTHER-SUGGESTIONS" )}</Heading4>
          ) }
        </>
      )}
      <CommentBox />
    </>
  ), [
    hasOtherSuggestions,
    loading,
    onPressPhoto,
    photoUris,
    renderSuggestion,
    selectedPhotoUri,
    t,
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
