import type { FlashListProps } from "@shopify/flash-list";
import {
  ActivityIndicator, Body3, CustomFlashList, InfiniteScrollLoadingWheel,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import UserList from "components/UserList/UserList";
import React, { useCallback } from "react";
import type { ViewStyle } from "react-native";
import { useTranslation } from "sharedHooks";

interface Props<T> {
  canFetch?: boolean;
  contentContainerStyle?: ViewStyle;
  data: T[];
  fetchNextPage: ( ) => void;
  hideLoadingWheel: boolean;
  isFetchingNextPage: boolean;
  isConnected: boolean | null;
  keyExtractor?: FlashListProps<T>["keyExtractor"];
  layout?: "grid" | "user";
  numColumns?: number;
  renderItem?: FlashListProps<T>["renderItem"];
  renderItemSeparator?: FlashListProps<T>["ItemSeparatorComponent"];
  testID?: string;
  totalResults: number;
}

const ExploreFlashList = <T extends object, >( {
  canFetch,
  contentContainerStyle,
  data,
  fetchNextPage,
  hideLoadingWheel,
  isFetchingNextPage,
  isConnected,
  keyExtractor,
  layout,
  numColumns,
  renderItem,
  renderItemSeparator,
  testID,
  totalResults,
}: Props<T> ) => {
  const { t } = useTranslation( );

  const renderFooter = useCallback( ( ) => (
    <InfiniteScrollLoadingWheel
      hideLoadingWheel={hideLoadingWheel}
      layout={layout}
      explore
      isConnected={isConnected}
    />
  ), [hideLoadingWheel, layout, isConnected] );

  const renderLoading = useCallback( ( ) => {
    if ( totalResults === 0 ) {
      return (
        <Body3 className="align-center">{t( "No-results-found-try-different-search" )}</Body3> );
    }
    return ( <ActivityIndicator size={50} testID="ExploreFlashList.loading" /> );
  }, [totalResults, t] );

  const renderEmptyComponent = useCallback( ( ) => (
    <View className="self-center mt-[150px] p-4">
      {canFetch
        ? (
          renderLoading()
        )
        : <Body3 className="align-center">{t( "No-results-found-try-different-search" )}</Body3>}
    </View>
  ), [canFetch, renderLoading, t] );

  return layout === "user"
    ? (
      <UserList
        ListEmptyComponent={renderEmptyComponent( )}
        ListFooterComponent={renderFooter( )}
        contentContainerStyle={contentContainerStyle}
        users={data}
        onEndReached={fetchNextPage}
        refreshing={isFetchingNextPage}
      />
    )
    : (
      <CustomFlashList
        ItemSeparatorComponent={renderItemSeparator}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooter}
        contentContainerStyle={contentContainerStyle}
        data={data}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        onEndReached={fetchNextPage}
        refreshing={isFetchingNextPage}
        renderItem={renderItem}
        testID={testID}
      />
    );
};

export default ExploreFlashList;
