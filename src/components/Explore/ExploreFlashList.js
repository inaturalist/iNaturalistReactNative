// @flow
import { FlashList } from "@shopify/flash-list";
import InfiniteScrollLoadingWheel from "components/MyObservations/InfiniteScrollLoadingWheel";
import { Body3 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import { ActivityIndicator, Animated } from "react-native";
import { useTranslation } from "sharedHooks";

const AnimatedFlashList = Animated.createAnimatedComponent( FlashList );

type Props = {
  contentContainerStyle?: Object,
  data: Array<Object>,
  estimatedItemSize: number,
  fetchNextPage: boolean,
  handleScroll: Function,
  hideLoadingWheel: boolean,
  isFetchingNextPage: boolean,
  isOnline: boolean,
  keyExtractor: Function,
  layout?: string,
  numColumns?: number,
  renderItem: Function,
  renderItemSeparator?: Function,
  status: string,
  testID: string
};

const ExploreFlashList = ( {
  contentContainerStyle,
  data,
  estimatedItemSize,
  fetchNextPage,
  handleScroll,
  hideLoadingWheel,
  isFetchingNextPage,
  isOnline,
  keyExtractor,
  layout,
  numColumns,
  renderItem,
  renderItemSeparator,
  status,
  testID
}: Props ): Node => {
  const { t } = useTranslation( );

  const renderFooter = useCallback( ( ) => (
    <InfiniteScrollLoadingWheel
      hideLoadingWheel={hideLoadingWheel}
      layout={layout}
      explore
      isOnline={isOnline}
    />
  ), [hideLoadingWheel, layout, isOnline] );

  const renderEmptyComponent = useCallback( ( ) => (
    <View className="flex-1 justify-center items-center">
      {status === "loading"
        ? (
          <ActivityIndicator size="large" testID="ExploreFlashList.loading" />
        )
        : <Body3>{t( "No-results-found" )}</Body3>}
    </View>
  ), [status, t] );

  const renderHeader = useCallback( ( ) => <View className="mt-[180px]" />, [] );

  return (
    <AnimatedFlashList
      contentContainerStyle={contentContainerStyle}
      data={data}
      estimatedItemSize={estimatedItemSize}
      testID={testID}
      horizontal={false}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ItemSeparatorComponent={renderItemSeparator}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmptyComponent}
      initialNumToRender={5}
      onEndReached={fetchNextPage}
      onEndReachedThreshold={1}
      refreshing={isFetchingNextPage}
      onScroll={handleScroll}
      accessible
      numColumns={numColumns}
      ListHeaderComponent={renderHeader}
    />
  );
};

export default ExploreFlashList;
