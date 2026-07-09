import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import DefaultSearchOptions
  from "components/Explore/ExploreV2/components/DefaultSearchOptions";
import LocationDefaultOptions
  from "components/Explore/ExploreV2/components/LocationDefaultOptions";
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
import type { ExploreV2Subject, Place } from "providers/ExploreV2Context";
import {
  defaultExploreV2Location,
  EXPLORE_V2_ACTION,
  EXPLORE_V2_PLACE_MODE,
  useExploreV2,
} from "providers/ExploreV2Context";
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

type SelectedLocation =
  | { type: "place"; place: Place }
  | { type: "nearby"; lat: number; lng: number; radius: number }
  | { type: "nearby-needs-permission" }
  | { type: "worldwide" };

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

  // What the user selected on this instance of the screen
  const [selectedSubject, setSelectedSubject] = useState<ExploreV2Subject | null>( null );
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>( null );
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

  const handleSubjectSelect = useCallback( ( subject: ExploreV2Subject ) => {
    setSelectedSubject( subject );
    commitSubject( subjectToText( subject, commonNameIsPrimary ) );
    locationInputRef.current?.focus( );
  }, [commitSubject, commonNameIsPrimary] );

  const handleLocationSelect = useCallback( ( place: LocationSearchResultItem ) => {
    setSelectedLocation( {
      type: "place",
      place: { id: place.id, display_name: place.display_name },
    } );
    commitLocation( place.display_name );
    Keyboard.dismiss( );
  }, [commitLocation] );

  const handleSelectWorldwide = useCallback( ( ) => {
    setSelectedLocation( { type: "worldwide" } );
    // commitLocation is for display only so this should be safe
    commitLocation( t( "Worldwide" ) );
    Keyboard.dismiss( );
  }, [commitLocation, t] );

  const handleSelectNearby = useCallback( async ( ) => {
    const next = await defaultExploreV2Location( );
    setSelectedLocation(
      next.placeMode === EXPLORE_V2_PLACE_MODE.NEARBY
        ? {
          type: "nearby", lat: next.lat, lng: next.lng, radius: next.radius,
        }
        : { type: "nearby-needs-permission" },
    );
    commitLocation( t( "Nearby" ) );
    Keyboard.dismiss( );
  }, [commitLocation, t] );

  const handleReset = useCallback( ( ) => {
    clearSubject( );
    clearLocation( );
    setSelectedSubject( null );
    setSelectedLocation( null );
  }, [clearSubject, clearLocation] );

  const handleSearch = useCallback( ( ) => {
    Keyboard.dismiss( );
    // Commit the composed search to context. Fields left unselected on
    // this screen fall back to their defaults: no subject → all organisms,
    // no location → worldwide.
    dispatch(
      selectedSubject
        ? { type: EXPLORE_V2_ACTION.SET_SUBJECT, subject: selectedSubject }
        : { type: EXPLORE_V2_ACTION.CLEAR_SUBJECT },
    );
    switch ( selectedLocation?.type ) {
      case "place":
        dispatch( {
          type: EXPLORE_V2_ACTION.SET_LOCATION_PLACE,
          place: selectedLocation.place,
        } );
        break;
      case "nearby":
        dispatch( {
          type: EXPLORE_V2_ACTION.SET_LOCATION_NEARBY,
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          radius: selectedLocation.radius,
        } );
        break;
      case "nearby-needs-permission":
        dispatch( { type: EXPLORE_V2_ACTION.SET_LOCATION_NEEDS_PERMISSION } );
        break;
      default:
        dispatch( { type: EXPLORE_V2_ACTION.SET_LOCATION_WORLDWIDE } );
    }
    navigation.popTo( "ExploreResults" );
  }, [selectedSubject, selectedLocation, dispatch, navigation] );

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

  const showSubjectDefaults = !showLocation && !subjectHasQuery;
  const showLocationDefaults = showLocation && !locationHasQuery;
  let listEmptyComponent;
  if ( showSubjectDefaults ) {
    listEmptyComponent = <DefaultSearchOptions onSelectSubject={handleSubjectSelect} />;
  } else if ( showLocationDefaults ) {
    listEmptyComponent = (
      <LocationDefaultOptions
        onSelectNearby={handleSelectNearby}
        onSelectWorldwide={handleSelectWorldwide}
      />
    );
  } else {
    listEmptyComponent = (
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
          ListEmptyComponent={listEmptyComponent}
        />
      </View>
    </ViewWrapper>
  );
};

export default UniversalSearch;
