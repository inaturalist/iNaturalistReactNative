// @flow

import { ObservationsFlashList } from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import { useInfiniteObservationsScroll, useIsConnected } from "sharedHooks";

import MapViewContainer from "./MapViewContainer";

type Props = {
  queryParams: Object,
  region: Object,
  layout: string
}

const ObservationsView = ( {
  queryParams,
  region,
  layout
}: Props ): Node => {
  const {
    observations, isFetchingNextPage, fetchNextPage, status
  } = useInfiniteObservationsScroll( { upsert: false, params: queryParams } );

  const isOnline = useIsConnected( );

  if ( !layout ) { return null; }

  return layout === "map"
    ? (
      <MapViewContainer
        queryParams={queryParams}
        region={region}
        observations={observations}
      />
    )
    : (
      <ObservationsFlashList
        data={observations}
        dataCanBeFetched
        explore
        hideLoadingWheel={!isFetchingNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isOnline={isOnline}
        layout={layout}
        onEndReached={fetchNextPage}
        status={status}
        testID="ExploreObservationsAnimatedList"
      />
    );
};

export default ObservationsView;
