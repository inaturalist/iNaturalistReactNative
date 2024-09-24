// @flow
import MyObservationsEmpty from "components/MyObservations/MyObservationsEmpty";
import {
  ActivityIndicator, Body3, CustomFlashList
} from "components/SharedComponents";
import InfiniteScrollLoadingWheel
  from
  "components/SharedComponents/FlashList/InfiniteScrollLoadingWheel";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  forwardRef,
  useCallback,
  useMemo
} from "react";
import { Animated } from "react-native";
import { useGridLayout, useTranslation } from "sharedHooks";

import ObsItem from "./ObsItem";

const AnimatedFlashList = Animated.createAnimatedComponent( CustomFlashList );

type Props = {
  contentContainerStyle?: Object,
  data: Array<Object>,
  dataCanBeFetched?: boolean,
  explore: boolean,
  handleIndividualUploadPress: Function,
  onScroll?: Function,
  hideLoadingWheel: boolean,
  isConnected: boolean,
  isFetchingNextPage?: boolean,
  layout: "list" | "grid",
  onEndReached: Function,
  onLayout?: Function,
  renderHeader?: Function,
  showNoResults?: boolean,
  showObservationsEmptyScreen?: boolean,
  testID: string
};

const ObservationsFlashList: Function = forwardRef( ( {
  contentContainerStyle: contentContainerStyleProp = {},
  data,
  dataCanBeFetched,
  explore,
  handleIndividualUploadPress,
  onScroll,
  hideLoadingWheel,
  isConnected,
  isFetchingNextPage,
  layout,
  onEndReached,
  onLayout,
  renderHeader,
  showNoResults,
  showObservationsEmptyScreen,
  testID
}: Props, ref ): Node => {
  const {
    estimatedGridItemSize,
    flashListStyle,
    gridItemStyle,
    gridItemWidth,
    numColumns
  } = useGridLayout( layout );
  const { t } = useTranslation( );

  const renderItem = useCallback( ( { item } ) => (
    <ObsItem
      explore={explore}
      gridItemStyle={gridItemStyle}
      handleIndividualUploadPress={handleIndividualUploadPress}
      layout={layout}
      observation={item}
    />
  ), [explore, layout, gridItemStyle, handleIndividualUploadPress] );

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
      isConnected={isConnected}
      explore={explore}
    />
  ), [hideLoadingWheel, layout, isConnected, explore] );

  const contentContainerStyle = useMemo( ( ) => {
    if ( layout === "list" ) { return contentContainerStyleProp; }
    return {
      ...contentContainerStyleProp,
      ...flashListStyle
    };
  }, [
    contentContainerStyleProp,
    flashListStyle,
    layout
  ] );

  const renderEmptyComponent = useCallback( ( ) => {
    const showEmptyScreen = showObservationsEmptyScreen
      ? <MyObservationsEmpty isFetchingNextPage={isFetchingNextPage} />
      : (
        <Body3 className="self-center mt-[150px]">
          {t( "No-results-found-try-different-search" )}
        </Body3>
      );

    return showNoResults
      ? showEmptyScreen
      : (
        <View className="self-center mt-[150px]">
          <ActivityIndicator size={50} testID="ObservationsFlashList.loading" />
        </View>
      );
  }, [
    isFetchingNextPage,
    showObservationsEmptyScreen,
    showNoResults,
    t
  ] );

  const estimatedItemSize = layout === "grid"
    ? estimatedGridItemSize
    : 98;

  const extraData = {
    gridItemWidth,
    numColumns
  };

  // only used id as a fallback key because after upload
  // react thinks we've rendered a second item w/ a duplicate key
  const keyExtractor = item => item.uuid || item.id;

  const onMomentumScrollEnd = ( ) => {
    if ( dataCanBeFetched ) {
      onEndReached( );
    }
  };

  return (
    <AnimatedFlashList
      ItemSeparatorComponent={renderItemSeparator}
      ListEmptyComponent={renderEmptyComponent}
      ListFooterComponent={renderFooter}
      ListHeaderComponent={renderHeader}
      contentContainerStyle={contentContainerStyle}
      data={data}
      estimatedItemSize={estimatedItemSize}
      extraData={extraData}
      ref={ref}
      key={numColumns}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      onLayout={onLayout}
      onMomentumScrollEnd={onMomentumScrollEnd}
      onScroll={onScroll}
      refreshing={isFetchingNextPage}
      renderItem={renderItem}
      testID={testID}
    />
  );
} );

export default ObservationsFlashList;
