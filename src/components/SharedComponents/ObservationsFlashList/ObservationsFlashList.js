// @flow
import { FlashList } from "@shopify/flash-list";
import InfiniteScrollLoadingWheel from "components/MyObservations/InfiniteScrollLoadingWheel";
import MyObservationsEmpty from "components/MyObservations/MyObservationsEmpty";
import { Body3 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback, useMemo
} from "react";
import { ActivityIndicator, Animated } from "react-native";
import { BREAKPOINTS } from "sharedHelpers/breakpoint";
import { useDeviceOrientation, useTranslation } from "sharedHooks";

import ObsItem from "./ObsItem";

const AnimatedFlashList = Animated.createAnimatedComponent( FlashList );

type Props = {
  isFetchingNextPage?: boolean,
  layout: "list" | "grid",
  data: Array<Object>,
  onEndReached: Function,
  uploadState: Object,
  testID: string,
  handleScroll?: Function,
  status?: string,
  showObservationsEmptyScreen?: boolean,
  isOnline: boolean,
  uploadSingleObservation?: Function,
  explore: boolean,
  hideLoadingWheel: boolean,
  renderHeader?: Function
};

const GUTTER = 15;

const ObservationsFlashList = ( {
  isFetchingNextPage,
  layout,
  data,
  onEndReached,
  uploadState,
  testID,
  handleScroll,
  status,
  showObservationsEmptyScreen,
  isOnline,
  uploadSingleObservation,
  explore,
  hideLoadingWheel,
  renderHeader
}: Props ): Node => {
  const {
    isLandscapeMode,
    isTablet,
    screenHeight,
    screenWidth
  } = useDeviceOrientation( );
  const { t } = useTranslation( );

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

  const numColumns = calculateNumColumns( );
  const gridItemWidth = calculateGridItemWidth( numColumns );

  const renderItem = useCallback( ( { item } ) => (
    <ObsItem
      observation={item}
      layout={layout}
      gridItemWidth={gridItemWidth}
      uploadSingleObservation={uploadSingleObservation}
      uploadState={uploadState}
      explore={explore}
    />
  ), [gridItemWidth, explore, layout, uploadState, uploadSingleObservation] );

  const renderItemSeparator = useCallback( ( ) => {
    if ( layout === "grid" ) {
      return null;
    }
    return <View className="border-b border-lightGray" />;
  }, [layout] );

  const renderFooter = useCallback( ( ) => (
    <InfiniteScrollLoadingWheel
      hideLoadingWheel={hideLoadingWheel}
      layout={layout}
      isOnline={isOnline}
      explore={explore}
    />
  ), [hideLoadingWheel, layout, isOnline, explore] );

  const contentContainerStyle = useMemo( ( ) => {
    if ( layout === "list" ) { return {}; }
    return {
      paddingLeft: GUTTER / 2,
      paddingRight: GUTTER / 2
    };
  }, [layout] );

  const renderEmptyComponent = useCallback( ( ) => {
    const showEmptyScreen = showObservationsEmptyScreen
      ? <MyObservationsEmpty isFetchingNextPage={isFetchingNextPage} />
      : <Body3 className="self-center mt-[150px]">{t( "No-results-found" )}</Body3>;

    return status === "loading"
      ? (
        <View className="self-center mt-[150px]">
          <ActivityIndicator size="large" testID="ObservationsFlashList.loading" />
        </View>
      )
      : showEmptyScreen;
  }, [
    isFetchingNextPage,
    showObservationsEmptyScreen,
    t,
    status
  ] );

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
      ItemSeparatorComponent={renderItemSeparator}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmptyComponent}
      ListHeaderComponent={renderHeader}
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
