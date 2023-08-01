// @flow
import { FlashList } from "@shopify/flash-list";
import InfiniteScrollLoadingWheel from "components/MyObservations/InfiniteScrollLoadingWheel";
import MyObservationsEmpty from "components/MyObservations/MyObservationsEmpty";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { Animated } from "react-native";
import { BREAKPOINTS } from "sharedHelpers/breakpoint";
import { useDeviceOrientation } from "sharedHooks";

import MyObservationsPressable from "./MyObservationsPressable";
import ObsGridItem from "./ObsGridItem";
import ObsListItem from "./ObsListItem";

const AnimatedFlashList = Animated.createAnimatedComponent( FlashList );

type Props = {
  isFetchingNextPage?: boolean,
  layout: "list" | "grid",
  data: Array<Object>,
  onEndReached: Function,
  allObsToUpload?: Array<Object>,
  currentUser?: ?Object,
  testID: string,
  handleScroll?: Function,
  hideUploadStatus?: boolean,
  showSpeciesSeen?: boolean
};

const GUTTER = 15;

const Item = React.memo(
  ( {
    observation, layout, gridItemWidth, setShowLoginSheet = false,
    hideUploadStatus, showSpeciesSeen
  } ) => (
    <MyObservationsPressable observation={observation}>
      {
        layout === "grid"
          ? (
            <ObsGridItem
              observation={observation}
              // 03022023 it seems like Flatlist is designed to work
              // better with RN styles than with Tailwind classes
              style={{
                height: gridItemWidth,
                width: gridItemWidth,
                margin: GUTTER / 2
              }}
              setShowLoginSheet={setShowLoginSheet}
              hideUploadStatus={hideUploadStatus}
              showSpeciesSeen={showSpeciesSeen}
            />
          )
          : (
            <ObsListItem
              observation={observation}
              setShowLoginSheet={setShowLoginSheet}
            />
          )
      }
    </MyObservationsPressable>
  )
);

const ObservationsFlashList = ( {
  isFetchingNextPage,
  layout,
  data,
  onEndReached,
  allObsToUpload,
  currentUser,
  testID,
  handleScroll,
  hideUploadStatus,
  showSpeciesSeen
}: Props ): Node => {
  const {
    isLandscapeMode,
    isTablet,
    screenHeight,
    screenWidth
  } = useDeviceOrientation( );
  const [numColumns, setNumColumns] = useState( 0 );
  const [gridItemWidth, setGridItemWidth] = useState( 0 );

  useEffect( ( ) => {
    const calculateGridItemWidth = columns => {
      const combinedGutter = ( columns + 1 ) * GUTTER;
      const gridWidth = isTablet
        ? screenWidth
        : Math.min( screenWidth, screenHeight );
      return Math.floor(
        ( gridWidth - combinedGutter ) / columns
      );
    };

    const calculateNumColumns = ( ) => {
      if ( layout === "list" || screenWidth <= BREAKPOINTS.md ) {
        return 1;
      }
      if ( !isTablet ) return 2;
      if ( isLandscapeMode ) return 6;
      if ( screenWidth <= BREAKPOINTS.xl ) return 2;
      return 4;
    };

    const columns = calculateNumColumns( );
    setGridItemWidth( calculateGridItemWidth( columns ) );
    setNumColumns( columns );
  }, [
    isLandscapeMode,
    isTablet,
    layout,
    screenHeight,
    screenWidth
  ] );

  const renderItem = ( { item } ) => (
    <Item
      observation={item}
      layout={layout}
      gridItemWidth={gridItemWidth}
      allObsToUpload={allObsToUpload}
      testID={testID}
      hideUploadStatus={hideUploadStatus}
      showSpeciesSeen={showSpeciesSeen}
    />
  );

  const renderItemSeparator = ( ) => {
    if ( layout === "grid" ) {
      return null;
    }
    return <View className="border-b border-lightGray" />;
  };

  const renderFooter = ( ) => (
    <InfiniteScrollLoadingWheel
      isFetchingNextPage={isFetchingNextPage}
      currentUser={currentUser}
      layout={layout}
    />
  );

  const contentContainerStyle = layout === "list"
    ? {}
    : {
      paddingLeft: GUTTER / 2,
      paddingRight: GUTTER / 2
    };

  const renderEmptyList = ( ) => <MyObservationsEmpty isFetchingNextPage={isFetchingNextPage} />;

  if ( numColumns === 0 ) { return null; }

  return (
    <AnimatedFlashList
      contentContainerStyle={contentContainerStyle}
      data={data}
      key={layout}
      estimatedItemSize={
        layout === "grid"
          ? gridItemWidth
          : 98
      }
      testID={testID}
      numColumns={numColumns}
      horizontal={false}
      // only used id as a fallback key because after upload
      // react thinks we've rendered a second item w/ a duplicate key
      keyExtractor={item => item.uuid || item.id}
      renderItem={renderItem}
      ListEmptyComponent={renderEmptyList}
      ItemSeparatorComponent={renderItemSeparator}
      ListFooterComponent={renderFooter}
      initialNumToRender={5}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.2}
      onScroll={handleScroll}
      refreshing={isFetchingNextPage}
      accessible
    />
  );
};

export default ObservationsFlashList;
