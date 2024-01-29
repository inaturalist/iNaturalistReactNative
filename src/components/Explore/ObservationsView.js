// @flow

import { ObservationsFlashList } from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import { useInfiniteObservationsScroll, useIsConnected } from "sharedHooks";

import MapView from "./MapView";

type Props = {
  exploreAPIParams: Object,
  region: Object,
  layout: ?string
}

const ObservationsView = ( {
  exploreAPIParams,
  region,
  layout
}: Props ): Node => {
  const params = {
    ...exploreAPIParams,
    per_page: 20
  };

  const {
    observations, isFetchingNextPage, fetchNextPage, status
  } = useInfiniteObservationsScroll( { upsert: false, params } );

  const isOnline = useIsConnected( );

  if ( !layout ) { return null; }

  return layout === "map"
    ? (
      <MapView
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
