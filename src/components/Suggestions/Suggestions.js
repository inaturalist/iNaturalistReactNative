// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Body1, Body3, Button, Heading4, TaxonResult,
  ViewWrapper
} from "components/SharedComponents";
import {
  View
} from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import { FlatList } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import {
  convertOfflineScoreToConfidence,
  convertOnlineScoreToConfidence
} from "sharedHelpers/convertScores";
import { useTranslation } from "sharedHooks";

import AddCommentPrompt from "./AddCommentPrompt";
import Attribution from "./Attribution";
import CommentBox from "./CommentBox";
import ObsPhotoSelectionList from "./ObsPhotoSelectionList";

type Props = {
  loadingSuggestions: boolean,
  nearbySuggestions: Array<Object>,
  onTaxonChosen: Function,
  photoUris: Array<string>,
  selectedPhotoUri: string,
  setSelectedPhotoUri: Function,
  taxonIds: Array<number>
};

const Suggestions = ( {
  loadingSuggestions,
  nearbySuggestions,
  onTaxonChosen,
  photoUris,
  selectedPhotoUri,
  setSelectedPhotoUri,
  taxonIds
}: Props ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { lastScreen } = params;

  const renderItem = useCallback( ( { item: suggestion, index } ) => {
    const renderResult = ( ) => (
      <TaxonResult
        key={suggestion.taxon.id}
        taxon={suggestion.taxon}
        handleCheckmarkPress={onTaxonChosen}
        testID={`SuggestionsList.taxa.${suggestion.taxon.id}`}
        confidence={suggestion?.score
          ? convertOfflineScoreToConfidence( suggestion?.score )
          : convertOnlineScoreToConfidence( suggestion.combined_score )}
        activeColor="bg-inatGreen"
        confidencePosition="text"
        first
      />
    );
    if ( index === 0 ) {
      return (
        <>
          <Heading4 className="mt-6 mb-4 ml-4">{t( "TOP-ID-SUGGESTION" )}</Heading4>
          <View className="bg-inatGreen/[.13]">
            {renderResult( )}
          </View>
        </>
      );
    }
    if ( index === 1 ) {
      return (
        <>
          <Heading4 className="mt-6 mb-4 ml-4">
            {suggestion?.score
              ? t( "ALL-SUGGESTIONS" )
              : t( "NEARBY-SUGGESTIONS" )}
          </Heading4>
          {renderResult( )}
        </>
      );
    }
    return renderResult( );
  }, [onTaxonChosen, t] );

  const renderEmptyList = useCallback( ( ) => {
    if ( loadingSuggestions ) {
      return (
        <View className="justify-center items-center mt-5" testID="SuggestionsList.loading">
          <ActivityIndicator large />
        </View>
      );
    }

    if ( !nearbySuggestions || nearbySuggestions.length === 0 ) {
      return (
        <>
          <Heading4 className="mt-6 mb-4 ml-4">{t( "TOP-ID-SUGGESTION" )}</Heading4>
          <Body1 className="mx-10 text-center">
            {t( "iNaturalist-isnt-able-to-provide-a-top-ID-suggestion-for-this-photo" )}
          </Body1>
          <Heading4 className="mt-6 mb-4 ml-4">{t( "NEARBY-SUGGESTIONS" )}</Heading4>
          <Body1 className="mx-10 text-center">
            {t( "iNaturalist-has-no-ID-suggestions-for-this-photo" )}
          </Body1>
        </>
      );
    }
    return null;
  }, [loadingSuggestions, nearbySuggestions, t] );

  const renderFooter = useCallback( ( ) => (
    <Attribution taxonIds={taxonIds} />
  ), [taxonIds] );

  const renderHeader = useCallback( ( ) => (
    <>
      <AddCommentPrompt />
      <View className="mx-5">
        <ObsPhotoSelectionList
          photoUris={photoUris}
          selectedPhotoUri={selectedPhotoUri}
          setSelectedPhotoUri={setSelectedPhotoUri}
        />
        <Body3 className="my-4 mx-3">{t( "Select-the-identification-you-want-to-add" )}</Body3>
        <Button
          text={t( "SEARCH-FOR-A-TAXON" )}
          onPress={( ) => navigation.navigate( "TaxonSearch", { lastScreen } )}
          accessibilityLabel={t( "Search" )}
        />
      </View>
      <CommentBox />
    </>
  ), [lastScreen, navigation, t, photoUris, selectedPhotoUri, setSelectedPhotoUri] );

  return (
    <ViewWrapper testID="suggestions">
      <FlatList
        data={nearbySuggestions}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyList}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={renderHeader}
      />
    </ViewWrapper>
  );
};

export default Suggestions;
