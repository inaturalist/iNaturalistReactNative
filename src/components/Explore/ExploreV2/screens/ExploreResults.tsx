import { useNetInfo } from "@react-native-community/netinfo";
import { OBSERVATIONS_TAB } from "appConstants/tabs";
import ExploreV2Header
  from "components/Explore/ExploreV2/components/ExploreV2Header";
import ExploreV2Tabs
  from "components/Explore/ExploreV2/components/ExploreV2Tabs";
import ExploreV2DebugSheet
  from "components/Explore/ExploreV2/ExploreV2DebugSheet";
import buildExploreV2QueryParams
  from "components/Explore/ExploreV2/helpers/buildQueryParams";
import ExploreV2SpeciesView
  from "components/Explore/ExploreV2/screens/ExploreV2SpeciesView";
import useInfiniteExploreScroll
  from "components/Explore/hooks/useInfiniteExploreScroll";
import ObservationsViewBar from "components/Explore/ObservationsViewBar";
import ObservationsFlashList from "components/ObservationsFlashList/ObservationsFlashList";
import {
  Body2,
  Button,
  RadioButtonSheet,
  ViewWrapper,
} from "components/SharedComponents";
import SortButton from "components/SharedComponents/Buttons/SortButton";
import { View } from "components/styledComponents";
import { EXPLORE_V2_ACTION, EXPLORE_V2_PLACE_MODE, useExploreV2 } from "providers/ExploreV2Context";
import React, { useMemo, useState } from "react";
import type { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import {
  OBSERVATIONS_SORT_OPTIONS,
  useObservationsSortLabels,
} from "sharedHelpers/observationsSort";
import { useTranslation } from "sharedHooks";
import useSpeciesCount from "sharedHooks/useSpeciesCount";
import useStoredLayout from "sharedHooks/useStoredLayout";

interface SortOption {
  label: string;
  text: string;
  value: OBSERVATIONS_SORT;
}

const ExploreResults = ( ) => {
  const { dispatch, state, requestLocationPermissions } = useExploreV2( );
  const { isConnected } = useNetInfo( );
  const { t } = useTranslation( );
  const [showSortSheet, setShowSortSheet] = useState( false );
  const observationsSortLabels = useObservationsSortLabels( );
  const { layout, writeLayoutToStorage } = useStoredLayout( "exploreV2ObservationsLayout" );

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
    {} as Record<OBSERVATIONS_SORT, SortOption>,
  );

  const queryParams = useMemo(
    ( ) => buildExploreV2QueryParams( state ),
    [state],
  );

  const canFetch = state.location.placeMode !== EXPLORE_V2_PLACE_MODE.UNINITIALIZED
    && state.location.placeMode !== EXPLORE_V2_PLACE_MODE.NEEDS_PERMISSION;

  const {
    fetchNextPage,
    isFetchingNextPage,
    handlePullToRefresh,
    observations,
    totalResults,
  } = useInfiniteExploreScroll( { params: queryParams, enabled: canFetch } );

  const speciesCountParams = useMemo( ( ) => {
    // take out params that don't apply to species count
    const {
      order_by: orderBy, order, per_page: perPage, ...filterParams
    } = queryParams;
    return filterParams;
  }, [queryParams] );

  const speciesCount = useSpeciesCount(
    speciesCountParams,
    { enabled: canFetch, keyPrefix: "exploreV2SpeciesCount" },
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
        onPress={requestLocationPermissions}
      />
    </View>
  );

  return (
    <ViewWrapper testID="ExploreResults" wrapperClassName="overflow-hidden">
      <View className="flex-1 overflow-hidden">
        <ExploreV2Header />
        <ExploreV2Tabs
          observationsCount={totalResults}
          speciesCount={speciesCount}
        />
        {state.location.placeMode === EXPLORE_V2_PLACE_MODE.NEEDS_PERMISSION
          ? renderPermissionPrompt( )
          : ( // more tabs to come in MOB-1347
            <>
              {state.activeTab === OBSERVATIONS_TAB
                ? (
                  <>
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
                      showNoResults={!canFetch || totalResults === 0}
                      testID="ExploreV2ObservationsList"
                    />
                    <ObservationsViewBar
                      hideMap
                      layout={layout}
                      updateObservationsView={writeLayoutToStorage}
                    />
                  </>
                )
                : (
                  <ExploreV2SpeciesView
                    enabled={canFetch}
                    isConnected={isConnected}
                    params={speciesCountParams}
                  />
                )}
              <ExploreV2DebugSheet />
              {state.activeTab === OBSERVATIONS_TAB && ( // todo sort btn on species in MOB-1334
                <SortButton
                  onPress={() => setShowSortSheet( true )}
                  accessibilityLabel={t( "Change-observations-sort-order" )}
                />
              )}
            </>
          )}
      </View>
      {showSortSheet && (
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
    </ViewWrapper>
  );
};

export default ExploreResults;
