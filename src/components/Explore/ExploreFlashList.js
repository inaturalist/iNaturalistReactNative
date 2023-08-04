// @flow
import { FlashList } from "@shopify/flash-list";
import InfiniteScrollLoadingWheel from "components/MyObservations/InfiniteScrollLoadingWheel";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Animated } from "react-native";

const AnimatedFlashList = Animated.createAnimatedComponent( FlashList );

type Props = {
  testID: string,
  handleScroll: Function,
  isFetchingNextPage: boolean,
  data: Array<Object>,
  renderItem: Function,
  renderItemSeparator?: Function,
  fetchNextPage: boolean,
  estimatedItemSize: number,
  keyExtractor: Function,
  layout?: string,
  contentContainerStyle?: Object,
  numColumns?: number
};

const ExploreFlashList = ( {
  testID,
  handleScroll,
  isFetchingNextPage,
  data,
  renderItem,
  renderItemSeparator,
  fetchNextPage,
  estimatedItemSize,
  keyExtractor,
  layout,
  contentContainerStyle,
  numColumns
}: Props ): Node => {
  const renderFooter = ( ) => (
    <InfiniteScrollLoadingWheel
      isFetchingNextPage={isFetchingNextPage}
      layout={layout}
    />
  );

  if ( !data || data.length === 0 ) {
    return null;
  }

  return (
    <View className="h-full mt-[180px]">
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
        initialNumToRender={5}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={1}
        refreshing={isFetchingNextPage}
        onScroll={handleScroll}
        accessible
        numColumns={numColumns}
      />
    </View>
  );
};

export default ExploreFlashList;
