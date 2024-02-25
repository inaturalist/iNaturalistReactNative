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

const OBS_LIST_CONTAINER_STYLE = { paddingTop: 50 };

const { width: defaultScreenWidth } = Dimensions.get( "screen" );

const ObservationsView = ( {
  layout,
  queryParams
}: Props ): Node => {
  const {
    observations, isFetchingNextPage, fetchNextPage, status
  } = useInfiniteObservationsScroll( { upsert: false, params: queryParams } );
  const {
    isLandscapeMode,
    isTablet,
    screenHeight,
    screenWidth
  } = useDeviceOrientation( );

  const isOnline = useIsConnected( );

  if ( !layout ) { return null; }

  // if ( layout === "map" ) return map;

  // We're rendering the map for grid and list views because we need the map
  // to zoom to the nearby location and calculate the query bounding box even
  // when we're on grid/list view. To do this, the map has to actually render
  // with something like it's real width and height, so we're rendering the
  // map and the list side by side in a view that's double the screen width
  // and overflowing, keeping the map off screen in grid/list view, moving it
  // on screen otherwise. This also prevents both the list and the map from
  // re-rendering every time you leave Explore and come back
  let containerWidth = defaultScreenWidth;
  if ( isTablet ) {
    containerWidth = screenWidth;
  } else if ( screenWidth ) {
    containerWidth = isLandscapeMode
      ? screenHeight
      : screenWidth;
  }
  return (
    <View
      className="flex-1 flex-row h-full overflow-hidden w-[200%]"
      // We need these dynamic styles
      // eslint-disable-next-line react-native/no-inline-styles
      style={{
        left: layout === "map"
          ? -containerWidth
          : 0
      }}
    >
      <ObservationsFlashList
        contentContainerStyle={OBS_LIST_CONTAINER_STYLE}
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
