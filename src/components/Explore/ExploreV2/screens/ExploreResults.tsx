import { refresh, useNetInfo } from "@react-native-community/netinfo";
import { useFocusEffect } from "@react-navigation/native";
import type { ApiTotalBounds } from "api/types";
import {
  IDENTIFIERS_TAB,
  OBSERVATIONS_TAB,
  OBSERVERS_TAB,
  SPECIES_TAB,
} from "appConstants/tabs";
import ExploreV2Header
  from "components/Explore/ExploreV2/components/ExploreV2Header";
import ExploreV2MapView
  from "components/Explore/ExploreV2/components/ExploreV2MapView";
import ExploreV2Tabs
  from "components/Explore/ExploreV2/components/ExploreV2Tabs";
import SaveSearchButton
  from "components/Explore/ExploreV2/components/SaveSearchButton";
import ExploreV2DebugSheet
  from "components/Explore/ExploreV2/ExploreV2DebugSheet";
import type { NearbyCoords }
  from "components/Explore/ExploreV2/helpers/buildQueryParams";
import buildExploreV2QueryParams
  from "components/Explore/ExploreV2/helpers/buildQueryParams";
import savedSearchKey from "components/Explore/ExploreV2/helpers/savedSearchKey";
import useUserTabCounts
  from "components/Explore/ExploreV2/hooks/useUserTabCounts";
import ExploreV2SpeciesView
  from "components/Explore/ExploreV2/screens/ExploreV2SpeciesView";
import ExploreV2UsersView
  from "components/Explore/ExploreV2/screens/ExploreV2UsersView";
import useInfiniteExploreScroll
  from "components/Explore/hooks/useInfiniteExploreScroll";
import ObservationsViewBar from "components/Explore/ObservationsViewBar";
import ObservationsFlashList from "components/ObservationsFlashList/ObservationsFlashList";
import {
  Body2,
  Button,
  OfflineNotice,
  RadioButtonSheet,
  ViewWrapper,
} from "components/SharedComponents";
import SortButton from "components/SharedComponents/Buttons/SortButton";
import WarningSheet from "components/SharedComponents/Sheets/WarningSheet";
import { View } from "components/styledComponents";
import { EXPLORE_V2_ACTION, EXPLORE_V2_PLACE_MODE, useExploreV2 } from "providers/ExploreV2Context";
import React, { useCallback, useMemo, useState } from "react";
import type { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import {
  OBSERVATIONS_SORT_OPTIONS,
  useObservationsSortLabels,
} from "sharedHelpers/observationsSort";
import type { SPECIES_SORT } from "sharedHelpers/speciesSort";
import {
  EXPLORE_SPECIES_SORT_OPTIONS,
  speciesSortToApiParams,
  useSpeciesSortLabels,
} from "sharedHelpers/speciesSort";
import { useTranslation } from "sharedHooks";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useLocationPermission from "sharedHooks/useLocationPermission";
import useSpeciesCount from "sharedHooks/useSpeciesCount";
import useStoredLayout from "sharedHooks/useStoredLayout";
import type { ExploreV2AdvancedSearchSlice } from "stores/createExploreV2AdvancedSearchSlice";
import type { ExploreV2SearchesSlice, SavedSearch } from "stores/createExploreV2SearchesSlice";
import { SAVED_LIMIT } from "stores/createExploreV2SearchesSlice";
import useStore from "stores/useStore";

// Please don't change this to an aliased path or the e2e mock will not get
// used in our e2e tests on Github Actions
import fetchCoarseUserLocation from "../../../../sharedHelpers/fetchCoarseUserLocation";

interface SortOption<SortValue> {
  label: string;
  text: string;
  value: SortValue;
}

const ExploreResults = ( ) => {
  const { dispatch, state } = useExploreV2( );
  const currentUser = useCurrentUser( );
  const currentUserId = currentUser?.id;
  const {
    hasPermissions,
    hasBlockedPermissions,
    renderPermissionsGate,
    requestPermissions,
  } = useLocationPermission( );
  const { isConnected } = useNetInfo( );
  const { t } = useTranslation( );
  const [showSortSheet, setShowSortSheet] = useState( false );
  const [showSavedLimitSheet, setShowSavedLimitSheet] = useState( false );
  const savedSearches: SavedSearch[] = useStore(
    ( storeState: ExploreV2SearchesSlice ) => storeState.exploreSavedSearches.searches,
  );
  const saveSearch = useStore(
    ( storeState: ExploreV2SearchesSlice ) => storeState.exploreSavedSearches.saveSearch,
  );
  const removeSearch = useStore(
    ( storeState: ExploreV2SearchesSlice ) => storeState.exploreSavedSearches.removeSearch,
  );
  const observationsSortLabels = useObservationsSortLabels( );
  const speciesSortLabels = useSpeciesSortLabels( );
  const { layout, writeLayoutToStorage } = useStoredLayout( "exploreV2ObservationsLayout" );
  const advancedSearchMode = useStore(
    ( storeState: ExploreV2AdvancedSearchSlice ) => storeState
      .exploreV2AdvancedSearch.advancedSearchMode,
  );

  const showMap = layout === "map";

  const sortOptions = OBSERVATIONS_SORT_OPTIONS.reduce(
    ( acc, sortBy ) => {
      const { label, text } = observationsSortLabels[sortBy];
      acc[sortBy] = {
        label,
        text,
        value: sortBy,
      };
      return acc;
    },
    {} as Record<OBSERVATIONS_SORT, SortOption<OBSERVATIONS_SORT>>,
  );

  const speciesSortOptions = EXPLORE_SPECIES_SORT_OPTIONS.reduce(
    ( acc, sortBy ) => {
      const { label, text } = speciesSortLabels[sortBy];
      acc[sortBy] = {
        label,
        text,
        value: sortBy,
      };
      return acc;
    },
    {} as Record<SPECIES_SORT, SortOption<SPECIES_SORT>>,
  );

  const isNearby = state.location.placeMode === EXPLORE_V2_PLACE_MODE.NEARBY;
  const [nearbyCoords, setNearbyCoords] = useState<NearbyCoords | undefined>( undefined );

  useFocusEffect( useCallback( ( ) => {
    let cancelled = false;
    if ( isNearby && hasBlockedPermissions ) {
      // perms blocked: fall back to worldwide
      dispatch( { type: EXPLORE_V2_ACTION.SET_LOCATION_WORLDWIDE } );
    } else if ( isNearby && hasPermissions === true && nearbyCoords === undefined ) {
      fetchCoarseUserLocation( ).then( location => {
        if ( cancelled ) return;
        if ( typeof location?.latitude === "number" ) {
          setNearbyCoords( { lat: location.latitude, lng: location.longitude, radius: 1 } );
        } else {
          // Perms granted but no fix — fall back to worldwide.
          dispatch( { type: EXPLORE_V2_ACTION.SET_LOCATION_WORLDWIDE } );
        }
      } );
    }
    return ( ) => { cancelled = true; };
  }, [isNearby, hasPermissions, hasBlockedPermissions, nearbyCoords, dispatch] ) );

  const handleCurrentLocationPress = useCallback(
    ( ) => dispatch( { type: EXPLORE_V2_ACTION.SET_LOCATION_NEARBY } ),
    [dispatch],
  );

  const handleRedoSearchPress = useCallback(
    ( bounds: ApiTotalBounds ) => dispatch( {
      type: EXPLORE_V2_ACTION.SET_LOCATION_MAP_AREA,
      bounds,
    } ),
    [dispatch],
  );

  const needsPermission = isNearby && hasPermissions === false && !hasBlockedPermissions;
  const nearbyResolved = !isNearby || nearbyCoords !== undefined;
  const canFetch = !needsPermission && nearbyResolved;
  const showingResults = isConnected !== false && !needsPermission;

  const queryParams = useMemo(
    ( ) => buildExploreV2QueryParams( state, nearbyCoords, currentUserId ),
    [state, nearbyCoords, currentUserId],
  );

  const {
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    handlePullToRefresh,
    observations,
    totalBounds,
    totalResults,
  } = useInfiniteExploreScroll( { params: queryParams, enabled: canFetch } );

  const reload = useCallback( async ( ) => {
    // only refresh results if we're now connected
    const { isConnected: isConnectedNow } = await refresh( );
    if ( isConnectedNow ) {
      handlePullToRefresh( );
    }
  }, [handlePullToRefresh] );

  const baseSearchParams = useMemo( ( ) => {
    // take out the paging and sorting params that only apply to observations
    const {
      order_by: orderBy, order, per_page: perPage, ...filterParams
    } = queryParams;
    return filterParams;
  }, [queryParams] );

  const speciesListParams = useMemo( ( ) => ( {
    ...baseSearchParams,
    ...speciesSortToApiParams( state.speciesSortBy ),
  } ), [baseSearchParams, state.speciesSortBy] );

  const speciesCount = useSpeciesCount(
    baseSearchParams,
    { enabled: canFetch, keyPrefix: "exploreV2SpeciesCount" },
  );

  const { observersCount, identifiersCount } = useUserTabCounts(
    baseSearchParams,
    { enabled: canFetch && advancedSearchMode },
  );

  const renderPermissionPrompt = ( ) => (
    <View className="flex-1 justify-center p-4">
      <View className="items-center">
        <Body2>{t( "To-view-nearby-organisms-please-enable-location" )}</Body2>
      </View>
      <Button
        className="mt-5"
        text={t( "ALLOW-LOCATION-ACCESS" )}
        accessibilityHint={t( "Opens-location-permission-prompt" )}
        level="focus"
        onPress={requestPermissions}
      />
    </View>
  );

  const {
    subject, location, filters, sortBy, speciesSortBy,
  } = state;
  const currentSearchKey = useMemo(
    ( ) => savedSearchKey( { subject, location, filters } ),
    [filters, location, subject],
  );
  const isSaved = savedSearches.some( saved => saved.key === currentSearchKey );

  const handleSavePress = ( ) => {
    if ( isSaved ) {
      removeSearch( currentSearchKey );
    } else if ( savedSearches.length >= SAVED_LIMIT ) {
      setShowSavedLimitSheet( true );
    } else {
      saveSearch( {
        key: currentSearchKey, subject, location, sortBy, speciesSortBy, filters,
      } );
    }
  };

  const renderTabContent = ( ) => {
    switch ( state.activeTab ) {
      case OBSERVATIONS_TAB:
        return (
          <>
            {showMap
              ? (
                <ExploreV2MapView
                  isLoading={isLoading}
                  mapAreaBounds={state.location.placeMode === EXPLORE_V2_PLACE_MODE.MAP_AREA
                    ? state.location.bounds
                    : undefined}
                  nearbyCoords={nearbyCoords}
                  onCurrentLocationPress={handleCurrentLocationPress}
                  onRedoSearchPress={handleRedoSearchPress}
                  placeMode={state.location.placeMode}
                  queryParams={queryParams}
                  totalBounds={totalBounds}
                />
              )
              : (
                <ObservationsFlashList
                  data={observations}
                  dataCanBeFetched={canFetch}
                  explore
                  handlePullToRefresh={handlePullToRefresh}
                  hideLoadingWheel={!isFetchingNextPage}
                  isFetchingNextPage={isFetchingNextPage}
                  isConnected={isConnected}
                  layout={layout === "list"
                    ? "list"
                    : "grid"}
                  // bit over a misnomer on this prop; in this case it hides the
                  // ID/comments/quality badges that grid results can technically have
                  hideObsUploadStatus={layout !== "list"}
                  obsListKey="ExploreV2Observations"
                  onEndReached={fetchNextPage}
                  showNoResults={canFetch && totalResults === 0}
                  testID="ExploreV2ObservationsList"
                />
              )}
            <ObservationsViewBar
              layout={layout}
              updateObservationsView={writeLayoutToStorage}
              viewOptions={["map", "grid", "list"]}
            />
            {!showMap && (
              <SortButton
                onPress={() => setShowSortSheet( true )}
                accessibilityLabel={t( "Change-observations-sort-order" )}
              />
            )}
          </>
        );
      case SPECIES_TAB:
        return (
          <>
            <ExploreV2SpeciesView
              enabled={canFetch}
              isConnected={isConnected}
              params={speciesListParams}
            />
            <SortButton
              onPress={() => setShowSortSheet( true )}
              accessibilityLabel={t( "Change-species-sort-order" )}
            />
          </>
        );
      case OBSERVERS_TAB:
      case IDENTIFIERS_TAB:
        return (
          <ExploreV2UsersView
            key={state.activeTab}
            enabled={canFetch}
            isConnected={isConnected}
            params={baseSearchParams}
            tab={state.activeTab}
          />
        );
      default: {
        // Exhaustiveness check: ts fails if a new tab is added without a case.
        const _exhaustive: never = state.activeTab;
        return null;
      }
    }
  };

  const renderContent = ( ) => {
    if ( isConnected === false ) {
      return (
        <View className="flex-1">
          <OfflineNotice onPress={reload} />
        </View>
      );
    }
    if ( needsPermission ) {
      return renderPermissionPrompt( );
    }
    return (
      <>
        {renderTabContent( )}
        <ExploreV2DebugSheet />
      </>
    );
  };

  return (
    <ViewWrapper testID="ExploreResults" wrapperClassName="overflow-hidden">
      <View className="flex-1 overflow-hidden">
        <ExploreV2Header />
        <ExploreV2Tabs
          observationsCount={canFetch
            ? totalResults
            : undefined}
          speciesCount={canFetch
            ? speciesCount
            : undefined}
          observersCount={canFetch
            ? observersCount
            : undefined}
          identifiersCount={canFetch
            ? identifiersCount
            : undefined}
        />
        {renderContent( )}
        {showingResults && (
          <SaveSearchButton
            className={
              state.activeTab === OBSERVATIONS_TAB && showMap
                ? "bottom-[140px]"
                : "bottom-[82px]"
            }
            isSaved={isSaved}
            onPress={handleSavePress}
          />
        )}
      </View>
      {showSortSheet && state.activeTab === OBSERVATIONS_TAB && (
        <RadioButtonSheet
          headerText={t( "SORT-OBSERVATIONS" )}
          radioValues={sortOptions}
          selectedValue={state.sortBy}
          confirm={sortBy => {
            dispatch( {
              type: EXPLORE_V2_ACTION.SET_SORT,
              sortBy: sortBy as OBSERVATIONS_SORT,
            } );
            setShowSortSheet( false );
          }}
          onPressClose={() => setShowSortSheet( false )}
        />
      )}
      {showSortSheet && state.activeTab === SPECIES_TAB && (
        <RadioButtonSheet
          headerText={t( "SORT-SPECIES" )}
          radioValues={speciesSortOptions}
          selectedValue={state.speciesSortBy}
          confirm={speciesSortBy => {
            dispatch( {
              type: EXPLORE_V2_ACTION.SET_SPECIES_SORT,
              speciesSortBy: speciesSortBy as SPECIES_SORT,
            } );
            setShowSortSheet( false );
          }}
          onPressClose={() => setShowSortSheet( false )}
        />
      )}
      {showSavedLimitSheet && (
        <WarningSheet
          buttonText={t( "OK" )}
          buttonType="primary"
          confirm={( ) => setShowSavedLimitSheet( false )}
          headerText={t( "Saved-search-limit-reached" )}
          loading={false}
          onPressClose={( ) => setShowSavedLimitSheet( false )}
          testID="ExploreResults.savedLimitSheet"
          text={t( "Saved-search-limit-reached-body", { count: SAVED_LIMIT } )}
        />
      )}
      {renderPermissionsGate( {} )}
    </ViewWrapper>
  );
};

export default ExploreResults;
