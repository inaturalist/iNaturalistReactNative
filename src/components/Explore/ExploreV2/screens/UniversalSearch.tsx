import { useNavigation } from "@react-navigation/native";
import type { ApiPlace } from "api/types";
import classnames from "classnames";
import LocationSearchResult
  from "components/Explore/ExploreV2/components/LocationSearchResult";
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
import useDebouncedValue from "sharedHooks/useDebouncedValue";
import useLocationSearch from "sharedHooks/useLocationSearch";
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

// A row is either a subject suggestion (tagged with `type`) or a raw place. The
// list shows one kind at a time depending on the focused field, but they share a
// single FlatList so we never conditionally mount/unmount it.
type SearchResultItem = UniversalSearchResultItem | ApiPlace;

const resultKey = ( item: SearchResultItem ): string => {
  if ( !( "type" in item ) ) { return `place-${item.id}`; }
  switch ( item.type ) {
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

  const [subjectText, setSubjectText] = useState( "" );
  const [locationText, setLocationText] = useState( "" );
  const [filledFromSelection, setFilledFromSelection] = useState( false );
  const [locationFilledFromSelection, setLocationFilledFromSelection] = useState( false );
  // Which input is focused — decides whether the list shows subject or location
  // results. Subject autofocuses, so it's the initial active field.
  const [activeField, setActiveField] = useState<"subject" | "location">( "subject" );
  // The debounced value that actually drives the autocomplete query. Cleared on
  // selection so a chosen suggestion doesn't re-trigger a result list.
  const {
    debouncedValue: debouncedQuery,
    debounce: debounceQuery,
    setImmediately: setQueryImmediately,
  } = useDebouncedValue( "" );
  const {
    debouncedValue: debouncedLocationQuery,
    debounce: debounceLocationQuery,
    setImmediately: setLocationQueryImmediately,
  } = useDebouncedValue( "" );

  const locationInputRef = useRef<RNTextInput>( null );

  const { results, isLoading, refetch } = useUniversalSearch( debouncedQuery );
  const {
    results: locationResults,
    isLoading: locationIsLoading,
    refetch: locationRefetch,
  } = useLocationSearch( debouncedLocationQuery );

  const bothFilled = subjectText.length > 0 && locationText.length > 0;

  const hasQuery = debouncedQuery.trim( ).length > 0;
  const locationHasQuery = debouncedLocationQuery.trim( ).length > 0;
  const showLocation = activeField === "location";

  const handleSubjectTextChange = useCallback( ( text: string ) => {
    setSubjectText( text );
    setFilledFromSelection( false );
    debounceQuery( text );
  }, [debounceQuery] );

  const handleSubjectFocus = useCallback( ( ) => {
    setActiveField( "subject" );
    if ( !filledFromSelection ) { return; }
    setSubjectText( "" );
    setFilledFromSelection( false );
    setQueryImmediately( "" );
  }, [filledFromSelection, setQueryImmediately] );

  const handleLocationTextChange = useCallback( ( text: string ) => {
    setLocationText( text );
    setLocationFilledFromSelection( false );
    debounceLocationQuery( text );
  }, [debounceLocationQuery] );

  const handleLocationFocus = useCallback( ( ) => {
    setActiveField( "location" );
    if ( !locationFilledFromSelection ) { return; }
    setLocationText( "" );
    setLocationFilledFromSelection( false );
    setLocationQueryImmediately( "" );
  }, [locationFilledFromSelection, setLocationQueryImmediately] );

  const handleLocationSelect = useCallback( ( place: ApiPlace ) => {
    setLocationText( place.display_name ?? "" );
    setLocationFilledFromSelection( true );
    setLocationQueryImmediately( "" );
    dispatch( {
      type: EXPLORE_V2_ACTION.SET_LOCATION_PLACE,
      place: { id: place.id as number, display_name: place.display_name },
    } );
    Keyboard.dismiss( );
  }, [dispatch, setLocationQueryImmediately] );

  const handleSelect = useCallback( ( subject: ExploreV2Subject ) => {
    setSubjectText( subjectToText( subject, commonNameIsPrimary ) );
    setFilledFromSelection( true );
    setQueryImmediately( "" );
    dispatch( { type: EXPLORE_V2_ACTION.SET_SUBJECT, subject } );
    locationInputRef.current?.focus( );
  }, [commonNameIsPrimary, dispatch, setQueryImmediately] );

  const handleReset = useCallback( ( ) => {
    setSubjectText( "" );
    setLocationText( "" );
    setFilledFromSelection( false );
    setLocationFilledFromSelection( false );
    setQueryImmediately( "" );
    setLocationQueryImmediately( "" );
  }, [setQueryImmediately, setLocationQueryImmediately] );

  const handleSearch = useCallback( ( ) => {
    // TODO MOB-1338 follow-up: run the search (default to all organisms /
    // worldwide when a field is empty). Just dismiss the keyboard for now.
    Keyboard.dismiss( );
  }, [] );

  const renderItem = useCallback<ListRenderItem<SearchResultItem>>( ( { item } ) => {
    if ( "type" in item ) {
      return (
        <UniversalSearchResult
          result={item}
          onPress={( ) => handleSelect( resultToSubject( item ) )}
        />
      );
    }
    return (
      <LocationSearchResult
        place={item}
        onPress={( ) => handleLocationSelect( item )}
      />
    );
  }, [handleSelect, handleLocationSelect] );

  // Gate the data to [] until there's a query for the focused field, mirroring
  // the subject-only behavior: the list stays mounted and EmptySearchResults
  // covers the loading / no-results / no-query states.
  const subjectData: SearchResultItem[] = hasQuery
    ? results
    : [];
  const locationData: SearchResultItem[] = locationHasQuery
    ? locationResults
    : [];
  const listData = showLocation
    ? locationData
    : subjectData;

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
                  onChangeText={handleSubjectTextChange}
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
                  onChangeText={handleLocationTextChange}
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
                ? debouncedLocationQuery
                : debouncedQuery}
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
