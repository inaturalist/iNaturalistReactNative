// @flow
import { FlashList } from "@shopify/flash-list";
import Header from "components/MyObservations/Header";
import ViewWrapper from "components/SharedComponents/ViewWrapper";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Platform } from "react-native";
import { BREAKPOINTS } from "sharedHelpers/breakpoint";
import { useDeviceOrientation } from "sharedHooks";

import InfiniteScrollLoadingWheel from "./InfiniteScrollLoadingWheel";
import LoginSheet from "./LoginSheet";
import MyObservationsEmpty from "./MyObservationsEmpty";
import MyObservationsPressable from "./MyObservationsPressable";
import ObsGridItem from "./ObsGridItem";
import ObsListItem from "./ObsListItem";

const AnimatedFlashList = Animated.createAnimatedComponent( FlashList );

const { diffClamp } = Animated;

type Props = {
  isFetchingNextPage?: boolean,
  layout: "list" | "grid",
  observations: Array<Object>,
  onEndReached: Function,
  toggleLayout: Function,
  allObsToUpload: Array<Object>,
  currentUser: ?Object,
  showLoginSheet: boolean,
  setShowLoginSheet: Function,
};

const GUTTER = 15;

const Item = React.memo(
  ( {
    observation, layout, gridItemWidth, setShowLoginSheet
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

const MyObservations = ( {
  isFetchingNextPage,
  layout,
  observations,
  onEndReached,
  toggleLayout,
  allObsToUpload,
  currentUser,
  showLoginSheet,
  setShowLoginSheet
}: Props ): Node => {
  const {
    isLandscapeMode,
    isTablet,
    screenHeight,
    screenWidth
  } = useDeviceOrientation( );
  const [heightAboveToolbar, setHeightAboveToolbar] = useState( 0 );
  const [numColumns, setNumColumns] = useState( 0 );
  const [gridItemWidth, setGridItemWidth] = useState( 0 );

  const [hideHeaderCard, setHideHeaderCard] = useState( false );
  const [yValue, setYValue] = useState( 0 );
  // basing collapsible sticky header code off the example in this article
  // https://medium.com/swlh/making-a-collapsible-sticky-header-animations-with-react-native-6ad7763875c3
  const scrollY = useRef( new Animated.Value( 0 ) );

  // On Android, the scroll view offset is a double (not an integer), and interpolation shouldn't be
  // one-to-one, which causes a jittery header while slow scrolling (see issue #634).
  // See here as well: https://stackoverflow.com/a/60898411/1233767
  const scrollYClamped = diffClamp(
    scrollY.current,
    0,
    heightAboveToolbar * 2
  );

  // Same as comment above (see here: https://stackoverflow.com/a/60898411/1233767)
  const offsetForHeader = scrollYClamped.interpolate( {
    inputRange: [0, heightAboveToolbar * 2],
    // $FlowIgnore
    outputRange: [0, -heightAboveToolbar]
  } );

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

  const handleScroll = Animated.event(
    [
      {
        nativeEvent: {
          contentOffset: { y: scrollY.current }
        }
      }
    ],
    {
      listener: ( { nativeEvent } ) => {
        const { y } = nativeEvent.contentOffset;
        const hide = yValue < y;
        // there's likely a better way to do this, but for now fading out
        // the content that goes under the status bar / safe area notch on iOS
        if ( Platform.OS !== "ios" ) { return; }
        if ( hide !== hideHeaderCard ) {
          setHideHeaderCard( hide );
          setYValue( y );
        }
      },
      useNativeDriver: true
    }
  );

  const renderItem = ( { item } ) => (
    <Item
      observation={item}
      layout={layout}
      gridItemWidth={gridItemWidth}
      allObsToUpload={allObsToUpload}
      setShowLoginSheet={setShowLoginSheet}
    />
  );

  const renderEmptyList = ( ) => <MyObservationsEmpty isFetchingNextPage={isFetchingNextPage} />;

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

  if ( numColumns === 0 ) { return null; }

  return (
    <>
      <ViewWrapper>
        <View className="overflow-hidden">
          <Animated.View
            style={[
              {
                transform: [{ translateY: offsetForHeader }],
                height: isTablet
                  ? screenHeight
                  : Math.max( screenWidth, screenHeight )
              }
            ]}
          >
            <Header
              toggleLayout={toggleLayout}
              layout={layout}
              currentUser={currentUser}
              numObservations={observations.length}
              setHeightAboveToolbar={setHeightAboveToolbar}
              allObsToUpload={allObsToUpload}
              setShowLoginSheet={setShowLoginSheet}
            />
            <AnimatedFlashList
              contentContainerStyle={contentContainerStyle}
              data={observations.filter( o => o.isValid() )}
              key={layout}
              estimatedItemSize={
                layout === "grid"
                  ? gridItemWidth
                  : 98
              }
              testID="MyObservationsAnimatedList"
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
          </Animated.View>
        </View>
      </ViewWrapper>
      {showLoginSheet && <LoginSheet setShowLoginSheet={setShowLoginSheet} />}
    </>
  );
};

export default MyObservations;
