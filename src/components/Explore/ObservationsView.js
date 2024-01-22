// @flow

import { ObservationsFlashList } from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import { useInfiniteObservationsScroll, useIsConnected } from "sharedHooks";

import MapView from "./MapView";

type Props = {
  exploreAPIParams: Object,
  region: Object,
  observationsView: string
}

const ObservationsView = ( {
  exploreAPIParams,
  region,
  observationsView
}: Props ): Node => {
  const params = {
    ...exploreAPIParams,
    per_page: 20
  };
  // TODO: remove this console.log
  console.log( "params for searching observations :>> ", params );

  const {
    observations, isFetchingNextPage, fetchNextPage, status
  } = useInfiniteObservationsScroll( { upsert: false, params } );

  const isOnline = useIsConnected( );

  return observationsView === "map"
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
        layout={observationsView}
        onEndReached={fetchNextPage}
        status={status}
        testID="ExploreObservationsAnimatedList"
      />
    );
};

export default ObservationsView;
