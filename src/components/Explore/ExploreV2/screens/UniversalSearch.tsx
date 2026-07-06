import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import DefaultSearchOptions
  from "components/Explore/ExploreV2/components/DefaultSearchOptions";
import LocationSearchResult
  from "components/Explore/ExploreV2/components/LocationSearchResult";
import UniversalSearchResult
  from "components/Explore/ExploreV2/components/UniversalSearchResult";
import {
  resultToSubject,
  subjectToText,
} from "components/Explore/ExploreV2/helpers/universalSearchSubject";
import type { LocationSearchResultItem }
  from "components/Explore/ExploreV2/hooks/useLocationSearch";
import useLocationSearch from "components/Explore/ExploreV2/hooks/useLocationSearch";
import type { UniversalSearchResultItem }
  from "components/Explore/ExploreV2/hooks/useUniversalSearch";
import useUniversalSearch from "components/Explore/ExploreV2/hooks/useUniversalSearch";
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
import { getShadow } from "styles/global";
import colors from "styles/tailwindColors";

const DROP_SHADOW = getShadow( );

// Underlining via style instead className prop seemed to override other styling
const UNDERLINE_STYLE = { textDecorationLine: "underline" } as const;

const INPUT_BOX_CLASSES = classnames(
  "flex-row items-center px-3 h-[44px]",
  "border border-lightGray rounded-lg",
);

// A row is either a subject suggestion or a place, discriminated by `type`. The
// list shows one kind at a time depending on the focused field, but they share a
// single FlatList so we never conditionally mount/unmount it.
type SearchResultItem = UniversalSearchResultItem | LocationSearchResultItem;

const resultKey = ( item: SearchResultItem ): string => {
  switch ( item.type ) {
    case "place":
      return `place-${item.id}`;
    case "user":
      return `user-${item.user.id}`;
    case "project":
      return `project-${item.project.id}`;
    case "taxon":
    default:
      return `taxon-${item.taxon.id}`;
  }
};

const UniversalSearch = ( ) => {
  const navigation = useNavigation<ExploreStackScreenProps<"UniversalSearch">["navigation"]>( );
  const { t } = useTranslation( );
  const { dispatch } = useExploreV2( );
  const currentUser = useCurrentUser( );
  const commonNameIsPrimary = currentUser?.prefers_common_names !== false
    && currentUser?.prefers_scientific_name_first !== true;

  // Which field's result list is showing. tracks the last-focused field rather
  // than live focus. Subject autofocuses, so it's the initial value.
  const [resultsField, setResultsField] = useState<"subject" | "location">( "subject" );
  const {
    text: subjectText,
    debouncedQuery: subjectQuery,
    hasQuery: subjectHasQuery,
    onChangeText: onChangeSubjectText,
    handleFocus: focusSubjectField,
    commit: commitSubject,
    clear: clearSubject,
  } = useSearchField( );
  const {
    text: locationText,
    debouncedQuery: locationQuery,
    hasQuery: locationHasQuery,
    onChangeText: onChangeLocationText,
    handleFocus: focusLocationField,
    commit: commitLocation,
    clear: clearLocation,
  } = useSearchField( );

  const locationInputRef = useRef<RNTextInput>( null );

  const { results, isLoading, refetch } = useUniversalSearch( subjectQuery );
  const {
    results: locationResults,
    isLoading: locationIsLoading,
    refetch: locationRefetch,
  } = useLocationSearch( locationQuery );

  const bothFilled = subjectText.length > 0 && locationText.length > 0;
  const showLocation = resultsField === "location";

  const handleSubjectFocus = useCallback( ( ) => {
    setResultsField( "subject" );
    focusSubjectField( );
  }, [focusSubjectField] );

  const handleLocationFocus = useCallback( ( ) => {
    setResultsField( "location" );
    focusLocationField( );
  }, [focusLocationField] );

  const handleSubjectSelect = useCallback( ( selectedSubject: ExploreV2Subject ) => {
    commitSubject( subjectToText( selectedSubject, commonNameIsPrimary ) );
    dispatch( { type: EXPLORE_V2_ACTION.SET_SUBJECT, subject: selectedSubject } );
    locationInputRef.current?.focus( );
  }, [commitSubject, commonNameIsPrimary, dispatch] );

  const handleLocationSelect = useCallback( ( place: LocationSearchResultItem ) => {
    commitLocation( place.display_name );
    dispatch( {
      type: EXPLORE_V2_ACTION.SET_LOCATION_PLACE,
      place: { id: place.id, display_name: place.display_name },
    } );
    Keyboard.dismiss( );
  }, [commitLocation, dispatch] );

  const handleReset = useCallback( ( ) => {
    clearSubject( );
    clearLocation( );
  }, [clearSubject, clearLocation] );

  const handleSearch = useCallback( ( ) => {
    // TODO MOB-1338 follow-up: run the search (default to all organisms /
    // worldwide when a field is empty). Just dismiss the keyboard for now.
    Keyboard.dismiss( );
  }, [] );

  const renderItem = useCallback<ListRenderItem<SearchResultItem>>( ( { item } ) => {
    if ( item.type === "place" ) {
      return (
        <LocationSearchResult
          place={item}
          onPress={( ) => handleLocationSelect( item )}
        />
      );
    }
    return (
      <UniversalSearchResult
        result={item}
        onPress={( ) => handleSubjectSelect( resultToSubject( item ) )}
      />
    );
  }, [handleSubjectSelect, handleLocationSelect] );

  // Gate the data to [] until there's a query for the focused field, mirroring
  // the subject-only behavior: the list stays mounted and EmptySearchResults
  // covers the loading / no-results / no-query states.
  const subjectData: SearchResultItem[] = subjectHasQuery
    ? results
    : [];
  const locationData: SearchResultItem[] = locationHasQuery
    ? locationResults
    : [];
  const listData = showLocation
    ? locationData
    : subjectData;

  let mainContent = null;
  /* Results for an active query, default options when empty, else nothing */
  if ( subjectText.trim( ).length === 0 ) {
    mainContent = ( <DefaultSearchOptions onSelectSubject={handleSelect} /> );
  } else if ( subjectHasQuery ) {
    mainContent = (
      <FlatList
        data={results}
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
    );
  }

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
                  onFocus={handleSubjectFocus}
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
                  onChangeText={onChangeLocationText}
                  onFocus={handleLocationFocus}
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
        {/* One always-mounted list; its contents follow the focused field. */}
        <FlatList
          data={listData}
          keyboardShouldPersistTaps="handled"
          keyExtractor={resultKey}
          renderItem={renderItem}
          ListEmptyComponent={(
            <EmptySearchResults
              isLoading={showLocation
                ? locationIsLoading
                : isLoading}
              searchQuery={showLocation
                ? locationQuery
                : subjectQuery}
              refetch={showLocation
                ? locationRefetch
                : refetch}
            />
          )}
        />
      </View>
    </ViewWrapper>
  );
};

export default UniversalSearch;
