// @flow

import {
  Map,
  ObservationsFlashList
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import { useInfiniteObservationsScroll, useIsConnected } from "sharedHooks";

type Props = {
  exploreParams: Object,
  region: Object,
  handleScroll: Function,
  observationsView: string
}

const ObservationsView = ( {
  exploreParams,
  region,
  handleScroll,
  observationsView
}: Props ): Node => {
  const {
    observations, isFetchingNextPage, fetchNextPage, status
  } = useInfiniteObservationsScroll( { upsert: false, params: exploreParams } );

  const isOnline = useIsConnected( );

  const tileMapParams = { };

  if ( exploreParams?.taxon_id ) {
    tileMapParams.taxon_id = exploreParams?.taxon_id;
  }
  if ( exploreParams?.place_id ) {
    tileMapParams.place_id = exploreParams?.place_id;
  }

  const renderHeader = useCallback( ( ) => <View className="mt-[180px]" />, [] );

  return observationsView === "map"
    ? (
      <Map
        showExplore
        className="h-full"
        showsCompass={false}
        region={region}
        observations={observations}
        tileMapParams={tileMapParams}
        withPressableObsTiles={tileMapParams !== null}
        showCurrentLocationButton
        showSwitchMapTypeButton
        switchMapTypeButtonClassName="left-20 bottom-[225px]"
        currentLocationButtonClassName="left-5 bottom-[225px]"
      />
    )
    : (
      <ObservationsFlashList
        isFetchingNextPage={isFetchingNextPage}
        layout={observationsView}
        data={observations}
        onEndReached={fetchNextPage}
        testID="ExploreObservationsAnimatedList"
        handleScroll={handleScroll}
        status={status}
        isOnline={isOnline}
        explore
        hideLoadingWheel={!isFetchingNextPage}
        renderHeader={renderHeader}
      />
    );
};

export default ObservationsView;
