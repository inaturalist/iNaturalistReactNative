import { useNetInfo } from "@react-native-community/netinfo";
import buildExploreV2QueryParams
  from "components/Explore/ExploreV2/buildQueryParams";
import ExploreV2Header
  from "components/Explore/ExploreV2/components/ExploreV2Header";
import ExploreV2DebugSheet
  from "components/Explore/ExploreV2/ExploreV2DebugSheet";
import useInfiniteExploreScroll
  from "components/Explore/hooks/useInfiniteExploreScroll";
import ObservationsFlashList from "components/ObservationsFlashList/ObservationsFlashList";
import {
  Body2,
  Button,
  RadioButtonSheet,
  ViewWrapper,
} from "components/SharedComponents";
import SortButton from "components/SharedComponents/Buttons/SortButton";
import { View } from "components/styledComponents";
import { EXPLORE_V2_PLACE_MODE, useExploreV2 } from "providers/ExploreV2Context";
import React, { useState } from "react";
import type { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import {
  OBSERVATIONS_SORT_OPTIONS,
  useObservationsSortLabels,
} from "sharedHelpers/observationsSort";
import { useTranslation } from "sharedHooks";

interface SortOption {
  label: string;
  text: string;
  value: OBSERVATIONS_SORT;
}

const ExploreResults = ( ) => {
  const { state, requestLocationPermissions } = useExploreV2( );
  const { isConnected } = useNetInfo( );
  const { t } = useTranslation( );
  const [showSortSheet, setShowSortSheet] = useState( false );
  const observationsSortLabels = useObservationsSortLabels( );

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

  const queryParams = buildExploreV2QueryParams( state );

  const canFetch = state.location.placeMode !== EXPLORE_V2_PLACE_MODE.UNINITIALIZED
    && state.location.placeMode !== EXPLORE_V2_PLACE_MODE.NEEDS_PERMISSION;

  const {
    fetchNextPage,
    isFetchingNextPage,
    handlePullToRefresh,
    observations,
    totalResults,
  } = useInfiniteExploreScroll( { params: queryParams, enabled: canFetch } );

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
        {state.location.placeMode === EXPLORE_V2_PLACE_MODE.NEEDS_PERMISSION
          ? renderPermissionPrompt( )
          : (
            <>
              <ObservationsFlashList
                data={observations}
                dataCanBeFetched={canFetch}
                explore
                handlePullToRefresh={handlePullToRefresh}
                hideLoadingWheel={!isFetchingNextPage}
                isFetchingNextPage={isFetchingNextPage}
                isConnected={isConnected}
                layout="list"
                obsListKey="ExploreV2Observations"
                onEndReached={fetchNextPage}
                showNoResults={!canFetch || totalResults === 0}
                testID="ExploreV2ObservationsList"
              />
              <ExploreV2DebugSheet />
              <SortButton
                onPress={() => setShowSortSheet( true )}
                // TODO: add label based on state wether this is sorting species or observations
                accessibilityLabel={t( "Change-observations-sort-order" )}
              />
            </>
          )}
      </View>
      {showSortSheet && (
        <RadioButtonSheet
          headerText={t( "SORT-OBSERVATIONS" )}
          radioValues={sortOptions}
          selectedValue={state.sortBy}
          // TODO: dispatch SET_SORT to update sort order
          confirm={() => setShowSortSheet( false )}
          onPressClose={() => setShowSortSheet( false )}
        />
      )}
    </ViewWrapper>
  );
};

export default ExploreResults;
