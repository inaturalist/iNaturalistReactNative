// @flow
import { FlashList } from "@shopify/flash-list";
import InfiniteScrollLoadingWheel from "components/MyObservations/InfiniteScrollLoadingWheel";
import { ActivityIndicator, Body3 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import { useTranslation } from "sharedHooks";

type Props = {
  contentContainerStyle?: Object,
  data: Array<Object>,
  estimatedItemSize: number,
  fetchNextPage: boolean,
  hideLoadingWheel: boolean,
  isFetchingNextPage: boolean,
  isConnected: boolean,
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
  hideLoadingWheel,
  isFetchingNextPage,
  isConnected,
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
      isConnected={isConnected}
    />
  ), [hideLoadingWheel, layout, isConnected] );

  const renderEmptyComponent = useCallback( ( ) => (
    <View className="flex-1 justify-center items-center">
      {status === "loading"
        ? (
          <ActivityIndicator size={50} testID="ExploreFlashList.loading" />
        )
        : <Body3>{t( "No-results-found" )}</Body3>}
    </View>
  ), [status, t] );

  const headerComponentStyle = layout === "grid" && {
    marginLeft: -7,
    marginRight: -7
  };

  return (
    <FlashList
      ItemSeparatorComponent={renderItemSeparator}
      ListEmptyComponent={renderEmptyComponent}
      ListFooterComponent={renderFooter}
      ListHeaderComponentStyle={headerComponentStyle}
      accessible
      contentContainerStyle={contentContainerStyle}
      data={data}
      estimatedItemSize={estimatedItemSize}
      horizontal={false}
      initialNumToRender={5}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      onEndReached={fetchNextPage}
      onEndReachedThreshold={1}
      refreshing={isFetchingNextPage}
      renderItem={renderItem}
      testID={testID}
    />
  );
};

export default ExploreFlashList;
