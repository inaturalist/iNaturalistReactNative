import { useNetInfo } from "@react-native-community/netinfo";
import buildExploreV2QueryParams
  from "components/Explore/ExploreV2/buildQueryParams";
import useInfiniteExploreScroll
  from "components/Explore/hooks/useInfiniteExploreScroll";
import ObservationsFlashList from "components/ObservationsFlashList/ObservationsFlashList";
import {
  Body2,
  ViewWrapper,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { EXPLORE_V2_PLACE_MODE, useExploreV2 } from "providers/ExploreV2Context";
import React, { useMemo } from "react";

const ExploreObservations = ( ) => {
  const { state } = useExploreV2( );
  const { isConnected } = useNetInfo( );

  const queryParams = useMemo( () => buildExploreV2QueryParams( state ), [state] );

  const canFetch = state.location.placeMode !== EXPLORE_V2_PLACE_MODE.UNINITIALIZED;

  const {
    fetchNextPage,
    isFetchingNextPage,
    handlePullToRefresh,
    observations,
    totalResults,
  } = useInfiniteExploreScroll( { params: queryParams, enabled: canFetch } );

  return (
    <ViewWrapper testID="ExploreObservations" wrapperClassName="overflow-hidden">
      <View className="flex-1 overflow-hidden">
        {/* eslint-disable-next-line i18next/no-literal-string */}
        <Body2>TODO: Header — MOB-1327</Body2>
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
      </View>
    </ViewWrapper>
  );
};

export default ExploreObservations;
