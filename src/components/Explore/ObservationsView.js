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
        className="h-full"
        currentLocationButtonClassName="left-5 bottom-[225px]"
        observations={observations}
        region={region}
        showCurrentLocationButton
        showExplore
        showSwitchMapTypeButton
        showsCompass={false}
        switchMapTypeButtonClassName="left-20 bottom-[225px]"
        tileMapParams={tileMapParams}
        withPressableObsTiles={tileMapParams !== null}
      />
    )
    : (
      <ObservationsFlashList
        data={observations}
        dataCanBeFetched
        explore
        handleScroll={handleScroll}
        hideLoadingWheel={!isFetchingNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isOnline={isOnline}
        layout={observationsView}
        onEndReached={fetchNextPage}
        renderHeader={renderHeader}
        status={status}
        testID="ExploreObservationsAnimatedList"
      />
    );
};

export default ObservationsView;
