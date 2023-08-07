// @flow
import { FlashList } from "@shopify/flash-list";
import InfiniteScrollLoadingWheel from "components/MyObservations/InfiniteScrollLoadingWheel";
import { Body3 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { ActivityIndicator, Animated } from "react-native";
import { useTranslation } from "sharedHooks";

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
  numColumns?: number,
  status: string
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
  numColumns,
  status
}: Props ): Node => {
  const { t } = useTranslation( );

  const renderFooter = ( ) => (
    <InfiniteScrollLoadingWheel
      isFetchingNextPage={isFetchingNextPage}
      layout={layout}
    />
  );

  if ( !data || data.length === 0 ) {
    return (
      <View className="flex-1 justify-center items-center">
        {status === "loading"
          ? (
            <ActivityIndicator size="large" />
          )
          : <Body3>{t( "No-results-found" )}</Body3>}
      </View>
    );
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
