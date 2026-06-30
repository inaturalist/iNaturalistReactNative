import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import UniversalSearchResult
  from "components/Explore/ExploreV2/components/UniversalSearchResult";
import {
  resultToSubject,
  subjectToText,
} from "components/Explore/ExploreV2/helpers/universalSearchSubject";
import EmptySearchResults from "components/Explore/SearchScreens/EmptySearchResults";
import ExploreSearchHeader from "components/Explore/SearchScreens/ExploreSearchHeader";
import ContainedSquareButton from "components/SharedComponents/Buttons/ContainedSquareButton";
import INatIcon from "components/SharedComponents/INatIcon";
import Body3 from "components/SharedComponents/Typography/Body3";
import ViewWrapper from "components/SharedComponents/ViewWrapper";
import {
  TextInput,
  View,
} from "components/styledComponents";
import type { ExploreStackScreenProps } from "navigation/types";
import type { ExploreV2Subject } from "providers/ExploreV2Context";
import { EXPLORE_V2_ACTION, useExploreV2 } from "providers/ExploreV2Context";
import React, { useCallback, useRef, useState } from "react";
import type { ListRenderItem, TextInput as RNTextInput } from "react-native";
import { FlatList, Keyboard } from "react-native";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useSearchField from "sharedHooks/useSearchField";
import useTranslation from "sharedHooks/useTranslation";
import type { UniversalSearchResultItem } from "sharedHooks/useUniversalSearch";
import useUniversalSearch from "sharedHooks/useUniversalSearch";
import { getShadow } from "styles/global";
import colors from "styles/tailwindColors";

const DROP_SHADOW = getShadow( );

// Underlining via style instead className prop seemed to override other styling
const UNDERLINE_STYLE = { textDecorationLine: "underline" } as const;

const INPUT_BOX_CLASSES = classnames(
  "flex-row items-center px-3 h-[44px]",
  "border border-lightGray rounded-lg",
);

const resultKey = ( result: UniversalSearchResultItem ): string => {
  switch ( result.type ) {
    case "user":
      return `user-${result.user.id}`;
    case "project":
      return `project-${result.project.id}`;
    case "taxon":
    default:
      return `taxon-${result.taxon.id}`;
  }
};

const UniversalSearch = ( ) => {
  const navigation = useNavigation<ExploreStackScreenProps<"UniversalSearch">["navigation"]>( );
  const { t } = useTranslation( );
  const { dispatch } = useExploreV2( );
  const currentUser = useCurrentUser( );
  const commonNameIsPrimary = currentUser?.prefers_common_names !== false
    && currentUser?.prefers_scientific_name_first !== true;

  const {
    text: subjectText,
    debouncedQuery: subjectQuery,
    hasQuery: subjectHasQuery,
    onChangeText: onChangeSubjectText,
    handleFocus: focusSubjectField,
    commit: commitSubject,
    clear: clearSubject,
  } = useSearchField( );
  const [locationText, setLocationText] = useState( "" );

  const locationInputRef = useRef<RNTextInput>( null );

  const { results, isLoading, refetch } = useUniversalSearch( subjectQuery );

  const bothFilled = subjectText.length > 0 && locationText.length > 0;

  const handleSelect = useCallback( ( subject: ExploreV2Subject ) => {
    commitSubject( subjectToText( subject, commonNameIsPrimary ) );
    dispatch( { type: EXPLORE_V2_ACTION.SET_SUBJECT, subject } );
    locationInputRef.current?.focus( );
  }, [commitSubject, commonNameIsPrimary, dispatch] );

  const handleReset = useCallback( ( ) => {
    clearSubject( );
    setLocationText( "" );
  }, [clearSubject] );

  const handleSearch = useCallback( ( ) => {
    // TODO MOB-1338 follow-up: run the search (default to all organisms /
    // worldwide when a field is empty). Just dismiss the keyboard for now.
    Keyboard.dismiss( );
  }, [] );

  const renderResult = useCallback<ListRenderItem<UniversalSearchResultItem>>( ( { item } ) => (
    <UniversalSearchResult
      result={item}
      onPress={( ) => handleSelect( resultToSubject( item ) )}
    />
  ), [handleSelect] );

  return (
    <ViewWrapper testID="UniversalSearch">
      <View className="bg-white" style={DROP_SHADOW}>
        <ExploreSearchHeader
          headerText={t( "SEARCH" )}
          closeModal={navigation.goBack}
          resetFilters={handleReset}
          testID="UniversalSearch.back"
        />
        <View className="px-4 pb-4">
          <View className="flex-row items-center">
            <View className="flex-1">
              <View className={INPUT_BOX_CLASSES}>
                <INatIcon name="magnifying-glass" size={15} color={colors.darkGray} />
                <TextInput
                  accessibilityLabel={t( "Search-for-species-user-or-project" )}
                  autoFocus
                  className="flex-1 ml-2 text-md font-Lato-Regular"
                  numberOfLines={1}
                  onChangeText={onChangeSubjectText}
                  onFocus={focusSubjectField}
                  placeholder={t( "Search-for-species-user-or-project" )}
                  placeholderTextColor={colors.mediumGray}
                  testID="UniversalSearch.subjectInput"
                  value={subjectText}
                />
              </View>
              <View className={classnames( INPUT_BOX_CLASSES, "-mt-px" )}>
                <INatIcon name="map-marker-outline" size={15} color={colors.darkGray} />
                <TextInput
                  accessibilityLabel={t( "Search-for-a-location" )}
                  className="flex-1 ml-2 text-md font-Lato-Regular"
                  numberOfLines={1}
                  onChangeText={setLocationText}
                  placeholder={t( "Search-for-a-location" )}
                  placeholderTextColor={colors.mediumGray}
                  ref={locationInputRef}
                  testID="UniversalSearch.locationInput"
                  value={locationText}
                />
              </View>
            </View>
            <View className="ml-3">
              <ContainedSquareButton
                accessibilityLabel={t( "Search" )}
                backgroundColor={bothFilled
                  ? colors.inatGreen
                  : colors.darkGray}
                icon="magnifying-glass"
                onPress={handleSearch}
                testID="UniversalSearch.searchButton"
              />
            </View>
          </View>
          <View className="mt-3 items-end">
            <Body3
              onPress={( ) => navigation.navigate( "AdvancedSearch" )}
              style={UNDERLINE_STYLE}
            >
              {t( "Advanced-Search" )}
            </Body3>
          </View>
        </View>
      </View>

      <View className="flex-1">
        {/* Only surface results for an active query */}
        <FlatList
          data={subjectHasQuery
            ? results
            : []}
          keyboardShouldPersistTaps="handled"
          keyExtractor={resultKey}
          renderItem={renderResult}
          ListEmptyComponent={(
            <EmptySearchResults
              isLoading={isLoading}
              searchQuery={subjectQuery}
              refetch={refetch}
            />
          )}
        />
      </View>
    </ViewWrapper>
  );
};

export default UniversalSearch;
