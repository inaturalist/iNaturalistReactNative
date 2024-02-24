// @flow

import { ObservationsFlashList } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Dimensions } from "react-native";
import {
  useDeviceOrientation,
  useInfiniteObservationsScroll,
  useIsConnected
} from "sharedHooks";

import MapView from "./MapView";

type Props = {
  layout: string,
  queryParams: Object
}

const { width: defaultScreenWidth } = Dimensions.get( "screen" );

const ObservationsView = ( {
  layout,
  queryParams
}: Props ): Node => {
  const {
    observations, isFetchingNextPage, fetchNextPage, status
  } = useInfiniteObservationsScroll( { upsert: false, params: queryParams } );
  const { screenWidth } = useDeviceOrientation( );

  const isOnline = useIsConnected( );

  if ( !layout ) { return null; }

  if ( layout === "map" ) return <MapView observations={observations} queryParams={queryParams} />;

  // We're rendering the map for grid and list views because we need the map
  // to zoom to the nearby location and calculate the query bounding box even
  // when we're on grid/list view. To do this, the map has to actually render
  // with something like it's real width and height, so we're rendering the
  // map and the list side by side in a view that's double the screen width
  // and overflowing, keeping the map off screen
  // TODO calculate the bounding box without rendering the map. Probably
  // doable w/ turf.js
  return (
    <View
      className="flex-row h-full justify-end"
      style={{ width: ( screenWidth || defaultScreenWidth ) * 2 }}
    >
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
      <MapView observations={observations} queryParams={queryParams} />
    </View>
  );
};

export default ObservationsView;
