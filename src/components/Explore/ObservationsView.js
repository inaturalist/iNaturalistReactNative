// @flow

import { ObservationsFlashList } from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import { useInfiniteObservationsScroll, useIsConnected } from "sharedHooks";

import MapView from "./MapView";

type Props = {
  layout: string,
  queryParams: Object
}

const ObservationsView = ( {
  layout,
  queryParams
}: Props ): Node => {
  const {
    observations, isFetchingNextPage, fetchNextPage, status
  } = useInfiniteObservationsScroll( { upsert: false, params: queryParams } );

  const isOnline = useIsConnected( );

  if ( !layout ) { return null; }

  return layout === "map"
    ? (
      <MapView
        observations={observations}
        queryParams={queryParams}
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
