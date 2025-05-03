// @flow

import {
  useNetInfo
} from "@react-native-community/netinfo";
import {
  searchObservations
} from "api/observations";
import useInfiniteExploreScroll from "components/Explore/hooks/useInfiniteExploreScroll";
import ObservationsFlashList from "components/ObservationsFlashList/ObservationsFlashList";
import { View } from "components/styledComponents";
import {
  useExplore
} from "providers/ExploreContext.tsx";
import type { Node } from "react";
import React, { useEffect } from "react";
import { Dimensions } from "react-native";
import {
  useCurrentUser,
  useDeviceOrientation,
  useQuery
} from "sharedHooks";

import MapView from "./MapView";

type Props = {
  canFetch?: boolean,
  layout: string,
  queryParams: Object,
  handleUpdateCount: Function,
  hasLocationPermissions?: boolean,
  renderLocationPermissionsGate: Function,
  requestLocationPermissions: Function
}

const OBS_LIST_CONTAINER_STYLE = { paddingTop: 50 };

const { width: defaultScreenWidth } = Dimensions.get( "screen" );

const ObservationsView = ( {
  canFetch,
  layout,
  queryParams,
  handleUpdateCount,
  hasLocationPermissions,
  renderLocationPermissionsGate,
  requestLocationPermissions
}: Props ): Node => {
  const currentUser = useCurrentUser( );
  const { state } = useExplore();
  const { excludeUser } = state;

  // get total count of current users obs
  const { data: currentUserObs } = useQuery(
    ["fetchCurrentUserObservations"],
    ( ) => searchObservations( {
      user_id: currentUser?.id,
      ...queryParams,
      fields: {
      }
    } ),
    {
      enabled: ( !!currentUser && !!excludeUser )
    }
  );

  const {
    fetchNextPage,
    isFetchingNextPage,
    handlePullToRefresh,
    observations,
    totalBounds,
    totalResults,
    isLoading
  } = useInfiniteExploreScroll( { params: queryParams, enabled: canFetch } );

  const curUserObsCount = currentUserObs?.total_results;
  const totalCount = ( excludeUser && currentUserObs && observations.length > 0 )
    ? totalResults - curUserObsCount
    : totalResults;

  const {
    isLandscapeMode,
    isTablet,
    screenHeight,
    screenWidth
  } = useDeviceOrientation( );

  useEffect( ( ) => {
    handleUpdateCount( "observations", totalCount );
  }, [handleUpdateCount, totalCount] );

  const { isConnected } = useNetInfo( );

  if ( !layout ) { return null; }

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
        dataCanBeFetched={canFetch}
        explore
        handlePullToRefresh={handlePullToRefresh}
        hideLoadingWheel={!isFetchingNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isConnected={isConnected}
        layout={layout}
        obsListKey="ExploreObservations"
        onEndReached={fetchNextPage}
        showNoResults={!canFetch || totalResults === 0}
        hideObsUploadStatus
        testID="ExploreObservationsAnimatedList"
      />
      <MapView
        observationBounds={totalBounds}
        isLoading={isLoading}
        queryParams={queryParams}
        hasLocationPermissions={hasLocationPermissions}
        renderLocationPermissionsGate={renderLocationPermissionsGate}
        requestLocationPermissions={requestLocationPermissions}
      />
    </View>
  );
};

export default ObservationsView;
