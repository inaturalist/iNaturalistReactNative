import { BottomTabBarHeightContext } from "@react-navigation/bottom-tabs";
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
import locationLabel from "components/Explore/ExploreV2/helpers/locationLabel";
import {
  resultToSubject,
  subjectToResult,
  subjectToText,
} from "components/Explore/ExploreV2/helpers/universalSearchSubject";
import type { LocationSearchResultItem }
  from "components/Explore/ExploreV2/hooks/useLocationSearch";
import useLocationSearch from "components/Explore/ExploreV2/hooks/useLocationSearch";
import type { UniversalSearchResultItem }
  from "components/Explore/ExploreV2/hooks/useUniversalSearch";
import useUniversalSearch from "components/Explore/ExploreV2/hooks/useUniversalSearch";
import EmptySearchResults from "components/Explore/SearchScreens/EmptySearchResults";
import ButtonBar from "components/SharedComponents/ButtonBar";
import Button from "components/SharedComponents/Buttons/Button";
import ContainedSquareButton from "components/SharedComponents/Buttons/ContainedSquareButton";
import INatIcon from "components/SharedComponents/INatIcon";
import SearchHeader from "components/SharedComponents/SearchHeader";
import Body3 from "components/SharedComponents/Typography/Body3";
import ViewWrapper from "components/SharedComponents/ViewWrapper";
import {
  TextInput,
  View,
} from "components/styledComponents";
import type { ExploreStackScreenProps } from "navigation/types";
import type {
  ExploreV2LocationState,
  ExploreV2Subject,
  Place,
} from "providers/ExploreV2Context";
import {
  EXPLORE_V2_ACTION,
  EXPLORE_V2_PLACE_MODE,
  useExploreV2,
} from "providers/ExploreV2Context";
import React, {
  useCallback, useContext, useMemo, useRef, useState,
} from "react";
import type { ListRenderItem, TextInput as RNTextInput } from "react-native";
import { FlatList, Keyboard } from "react-native";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useKeyboardInfo from "sharedHooks/useKeyboardInfo";
import useSearchField from "sharedHooks/useSearchField";
import useTranslation from "sharedHooks/useTranslation";
import type { ExploreV2RecentSearchesSlice } from "stores/createExploreV2RecentSearchesSlice";
import useStore from "stores/useStore";
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
  const { dispatch, state } = useExploreV2( );
  const currentUser = useCurrentUser( );
  const commonNameIsPrimary = currentUser?.prefers_common_names !== false
    && currentUser?.prefers_scientific_name_first !== true;

  const recordSubject = useStore(
    ( state: ExploreV2RecentSearchesSlice ) => state.exploreRecentSearches.recordSubject,
  );
  const recordPlace = useStore(
    ( state: ExploreV2RecentSearchesSlice ) => state.exploreRecentSearches.recordPlace,
  );

  const { keyboardHeight, keyboardShown } = useKeyboardInfo( );
  const tabBarHeight = useContext( BottomTabBarHeightContext ) ?? 0;
  const [buttonBarHeight, setButtonBarHeight] = useState( 0 );
  const listOverlap = keyboardShown
    ? Math.max( 0, keyboardHeight - tabBarHeight - buttonBarHeight )
    : 0;
  const listContentStyle = useMemo(
    ( ) => ( { paddingBottom: listOverlap } ),
    [listOverlap],
  );

  // Which field's result list is showing. tracks the last-focused field rather
  // than live focus. Subject autofocuses, so it's the initial value.
  const [resultsField, setResultsField] = useState<"subject" | "location">( "subject" );

  // What the user selected on this instance of the screen. Both are seeded from
  // the search in force, so leaving either alone keeps it and typing over the
  // selection replaces it. The seed is a snapshot taken at mount, not a live
  // binding to context, so everything derived from it is read once.
  const [selectedSubject, setSelectedSubject] = useState<ExploreV2Subject | null>(
    ( ) => state.subject,
  );
  const [selectedLocation, setSelectedLocation] = useState<ExploreV2LocationState | null>(
    ( ) => state.location,
  );
  const [seededSubjectText] = useState( ( ) => (
    state.subject
      ? subjectToText( state.subject, commonNameIsPrimary, t )
      : ""
  ) );
  // Worldwide is the absence of a place filter, so leave the field showing its
  // placeholder there; any other mode is a place worth keeping in view.
  const [seededLocationText] = useState( ( ) => (
    state.location.placeMode === EXPLORE_V2_PLACE_MODE.WORLDWIDE
      ? ""
      : locationLabel( state.location, t )
  ) );
  // iOS drops a selection applied while the field is becoming first responder,
  // so selectTextOnFocus does nothing for the focus that happens at mount (see
  // facebook/react-native#30585, #44307). The public `selection` prop holds it
  // instead. Control is released as soon as the user acts so the caret behaves
  // normally after that.
  const [subjectSelection, setSubjectSelection] = useState<
    { start: number; end: number } | undefined
  >( ( ) => ( seededSubjectText.length > 0
    ? { start: 0, end: seededSubjectText.length }
    : undefined ) );
  const releaseSubjectSelection = useCallback(
    ( ) => setSubjectSelection( undefined ),
    [],
  );
  const {
    text: subjectText,
    debouncedQuery: subjectQuery,
    hasQuery: subjectHasQuery,
    onChangeText: onChangeSubjectText,
    commit: commitSubject,
    clear: clearSubject,
  } = useSearchField( { initialText: seededSubjectText } );
  const {
    text: locationText,
    debouncedQuery: locationQuery,
    hasQuery: locationHasQuery,
    onChangeText: onChangeLocationText,
    commit: commitLocation,
    clear: clearLocation,
  } = useSearchField( { initialText: seededLocationText } );

  const locationInputRef = useRef<RNTextInput>( null );

  const { results, isLoading, refetch } = useUniversalSearch( subjectQuery );
  const {
    results: locationResults,
    isLoading: locationIsLoading,
    refetch: locationRefetch,
  } = useLocationSearch( locationQuery );

  const bothFilled = subjectText.length > 0 && locationText.length > 0;
  const showLocation = resultsField === "location";

  const handleSubjectFocus = useCallback( ( ) => setResultsField( "subject" ), [] );
  const handleLocationFocus = useCallback( ( ) => setResultsField( "location" ), [] );

  // Typing drops the staged value. Without this, a seeded or previously chosen
  // subject/place would still be committed while the field shows something else.
  const handleChangeSubjectText = useCallback( ( nextText: string ) => {
    setSelectedSubject( null );
    onChangeSubjectText( nextText );
  }, [onChangeSubjectText] );

  const handleChangeLocationText = useCallback( ( nextText: string ) => {
    setSelectedLocation( null );
    onChangeLocationText( nextText );
  }, [onChangeLocationText] );

  const handleSubjectSelect = useCallback( ( subject: ExploreV2Subject ) => {
    setSelectedSubject( subject );
    commitSubject( subjectToText( subject, commonNameIsPrimary, t ) );
    locationInputRef.current?.focus( );
  }, [commitSubject, commonNameIsPrimary, t] );

  const selectLocation = useCallback( ( location: ExploreV2LocationState ) => {
    setSelectedLocation( location );
    commitLocation( locationLabel( location, t ) );
    Keyboard.dismiss( );
  }, [commitLocation, t] );

  const handlePlaceSelect = useCallback( ( place: Place ) => {
    selectLocation( { placeMode: EXPLORE_V2_PLACE_MODE.PLACE, place } );
  }, [selectLocation] );

  const handleLocationSelect = useCallback( ( place: LocationSearchResultItem ) => {
    handlePlaceSelect( {
      id: place.id,
      display_name: place.display_name,
      place_type: place.place_type,
    } );
  }, [handlePlaceSelect] );

  const handleSelectWorldwide = useCallback(
    ( ) => selectLocation( { placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE } ),
    [selectLocation],
  );

  const handleSelectNearby = useCallback(
    ( ) => selectLocation( { placeMode: EXPLORE_V2_PLACE_MODE.NEARBY } ),
    [selectLocation],
  );

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
    switch ( selectedLocation?.placeMode ) {
      case EXPLORE_V2_PLACE_MODE.PLACE:
        dispatch( {
          type: EXPLORE_V2_ACTION.SET_LOCATION_PLACE,
          place: selectedLocation.place,
        } );
        break;
      case EXPLORE_V2_PLACE_MODE.NEARBY:
        dispatch( { type: EXPLORE_V2_ACTION.SET_LOCATION_NEARBY } );
        break;
      case EXPLORE_V2_PLACE_MODE.MAP_AREA:
        dispatch( {
          type: EXPLORE_V2_ACTION.SET_LOCATION_MAP_AREA,
          bounds: selectedLocation.bounds,
        } );
        break;
      default:
        dispatch( { type: EXPLORE_V2_ACTION.SET_LOCATION_WORLDWIDE } );
    }
    // Record recent subject if it's from an autocomplete result
    if ( selectedSubject && subjectToResult( selectedSubject ) ) {
      recordSubject( selectedSubject );
    }
    if ( selectedLocation?.placeMode === EXPLORE_V2_PLACE_MODE.PLACE ) {
      recordPlace( selectedLocation.place );
    }
    navigation.popTo( "ExploreResults" );
  }, [selectedSubject, selectedLocation, dispatch, navigation, recordSubject, recordPlace] );

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

  // A seeded or chosen value leaves text in the field, so gate on "nothing
  // typed yet" rather than "empty" or the launchpad would be hidden behind it.
  const showSubjectDefaults = !showLocation
    && ( selectedSubject !== null || subjectText.trim().length === 0 );
  const showLocationDefaults = showLocation
    && ( selectedLocation !== null || locationText.trim().length === 0 );
  let listEmptyComponent;
  if ( showSubjectDefaults ) {
    listEmptyComponent = <DefaultSearchOptions onSelectSubject={handleSubjectSelect} />;
  } else if ( showLocationDefaults ) {
    listEmptyComponent = (
      <LocationDefaultOptions
        onSelectNearby={handleSelectNearby}
        onSelectPlace={handlePlaceSelect}
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
        <SearchHeader
          headerText={t( "SEARCH" )}
          onClose={navigation.goBack}
          onReset={handleReset}
          testID="UniversalSearch.back"
        />
        <View className="px-4 pb-4">
          <View className="flex-row items-center">
            <View className="flex-1">
              <View className={INPUT_BOX_CLASSES}>
                <INatIcon name="magnifying-glass" size={15} color={colors.darkGray} />
                <TextInput
                  accessibilityLabel={t( "Search-for-species-user-or-project" )}
                  autoCorrect={false}
                  autoFocus
                  className="flex-1 ml-2 text-md font-Lato-Regular"
                  numberOfLines={1}
                  onChangeText={handleChangeSubjectText}
                  onFocus={handleSubjectFocus}
                  onSelectionChange={releaseSubjectSelection}
                  placeholder={t( "Search-for-species-user-or-project" )}
                  placeholderTextColor={colors.mediumGray}
                  selectTextOnFocus
                  selection={subjectSelection}
                  spellCheck={false}
                  testID="UniversalSearch.subjectInput"
                  value={subjectText}
                />
              </View>
              <View className={classnames( INPUT_BOX_CLASSES, "-mt-px" )}>
                <INatIcon name="map-marker-outline" size={15} color={colors.darkGray} />
                <TextInput
                  accessibilityLabel={t( "Search-for-a-location" )}
                  autoCorrect={false}
                  className="flex-1 ml-2 text-md font-Lato-Regular"
                  numberOfLines={1}
                  onChangeText={handleChangeLocationText}
                  onFocus={handleLocationFocus}
                  placeholder={t( "Search-for-a-location" )}
                  placeholderTextColor={colors.mediumGray}
                  ref={locationInputRef}
                  selectTextOnFocus
                  spellCheck={false}
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
          contentContainerStyle={listContentStyle}
          data={listData}
          keyboardShouldPersistTaps="handled"
          keyExtractor={resultKey}
          renderItem={renderItem}
          testID="UniversalSearch.results"
          ListEmptyComponent={listEmptyComponent}
        />
      </View>
      <ButtonBar
        containerClass="bg-white border-t border-lightGray"
        onLayout={
          ( { nativeEvent } ) => setButtonBarHeight( nativeEvent.layout.height )
        }
        testID="UniversalSearch.buttonBar"
      >
        <Button
          level="focus"
          onPress={handleSearch}
          testID="UniversalSearch.stickySearchButton"
          text={t( "SEARCH--button" )}
        />
      </ButtonBar>
    </ViewWrapper>
  );
};

export default UniversalSearch;
