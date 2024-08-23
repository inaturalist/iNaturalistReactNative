// @flow
import { FlashList } from "@shopify/flash-list";
import InfiniteScrollLoadingWheel from "components/MyObservations/InfiniteScrollLoadingWheel";
import MyObservationsEmpty from "components/MyObservations/MyObservationsEmpty";
import { ActivityIndicator, Body3 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  forwardRef,
  useCallback,
  useMemo
} from "react";
import { Animated } from "react-native";
import { BREAKPOINTS } from "sharedHelpers/breakpoint";
import { useDeviceOrientation, useTranslation } from "sharedHooks";

import ObsItem from "./ObsItem";

const AnimatedFlashList = Animated.createAnimatedComponent( FlashList );

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

const GUTTER = 15;

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
      explore={explore}
      gridItemWidth={gridItemWidth}
      handleIndividualUploadPress={handleIndividualUploadPress}
      layout={layout}
      observation={item}
    />
  ), [gridItemWidth, explore, layout, handleIndividualUploadPress] );

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
      paddingLeft: GUTTER / 2,
      paddingRight: GUTTER / 2
    };
  }, [
    contentContainerStyleProp,
    layout
  ] );

  const renderEmptyComponent = useCallback( ( ) => {
    const showEmptyScreen = showObservationsEmptyScreen
      ? <MyObservationsEmpty isFetchingNextPage={isFetchingNextPage} />
      : <Body3 className="self-center mt-[150px]">{t( "No-results-found" )}</Body3>;

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
    ? gridItemWidth
    : 98;

  if ( numColumns === 0 ) { return null; }

  const headerComponentStyle = layout === "grid" && {
    marginLeft: -7,
    marginRight: -7
  };

  return (
    <AnimatedFlashList
      ItemSeparatorComponent={renderItemSeparator}
      ListEmptyComponent={renderEmptyComponent}
      ListFooterComponent={renderFooter}
      ListHeaderComponent={renderHeader}
      ListHeaderComponentStyle={headerComponentStyle}
      accessible
      contentContainerStyle={contentContainerStyle}
      data={data}
      estimatedItemSize={estimatedItemSize}
      horizontal={false}
      initialNumToRender={5}
      key={layout}
      // only used id as a fallback key because after upload
      // react thinks we've rendered a second item w/ a duplicate key
      keyExtractor={item => item.uuid || item.id}
      numColumns={numColumns}
      ref={ref}
      onEndReachedThreshold={0.2}
      onLayout={onLayout}
      onMomentumScrollEnd={( ) => {
        if ( dataCanBeFetched ) {
          onEndReached( );
        }
      }}
      onScroll={onScroll}
      refreshing={isFetchingNextPage}
      renderItem={renderItem}
      testID={testID}
    />
  );
} );

export default ObservationsFlashList;
