// @flow
import { FlashList } from "@shopify/flash-list";
import Header from "components/MyObservations/Header";
import ViewWrapper from "components/SharedComponents/ViewWrapper";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useRef, useState } from "react";
import { Animated, Dimensions, Platform } from "react-native";

import InfiniteScrollLoadingWheel from "./InfiniteScrollLoadingWheel";
import LoginSheet from "./LoginSheet";
import MyObservationsEmpty from "./MyObservationsEmpty";
import MyObservationsPressable from "./MyObservationsPressable";
import ObsGridItem from "./ObsGridItem";
import ObsListItem from "./ObsListItem";

const AnimatedFlashList = Animated.createAnimatedComponent( FlashList );

const { diffClamp } = Animated;

type Props = {
  isLoading?: boolean,
  layout: "list" | "grid",
  observations: Array<Object>,
  onEndReached: Function,
  setLayout: Function,
  uploadStatus: Object,
  currentUser: ?Object,
  showLoginSheet: boolean,
  setShowLoginSheet: Function,
};

const { width: screenWidth, height: screenHeight } = Dimensions.get( "screen" );
const GUTTER = 15;

const Item = React.memo(
  ( {
    observation, layout, gridItemWidth, uploadStatus, setShowLoginSheet
  } ) => (
    <MyObservationsPressable observation={observation}>
      {layout === "grid" ? (
        <ObsGridItem
          observation={observation}
          // 03022023 it seems like Flatlist is designed to work
          // better with RN styles than with Tailwind classes
          style={{
            height: gridItemWidth,
            width: gridItemWidth,
            marginLeft: GUTTER / 2,
            marginBottom: GUTTER,
            marginRight: GUTTER / 2
          }}
          uploadStatus={uploadStatus}
          setShowLoginSheet={setShowLoginSheet}
        />
      ) : (
        <ObsListItem
          observation={observation}
          uploadStatus={uploadStatus}
          setShowLoginSheet={setShowLoginSheet}
        />
      )}
    </MyObservationsPressable>
  )
);

const MyObservations = ( {
  isLoading,
  layout,
  observations,
  onEndReached,
  setLayout,
  uploadStatus,
  currentUser,
  showLoginSheet,
  setShowLoginSheet
}: Props ): Node => {
  const [heightAboveToolbar, setHeightAboveToolbar] = useState( 0 );

  const [hideHeaderCard, setHideHeaderCard] = useState( false );
  const [yValue, setYValue] = useState( 0 );
  // basing collapsible sticky header code off the example in this article
  // https://medium.com/swlh/making-a-collapsible-sticky-header-animations-with-react-native-6ad7763875c3
  const scrollY = useRef( new Animated.Value( 0 ) );
  const scrollYClamped = diffClamp( scrollY.current, 0, heightAboveToolbar + 10 );

  const offsetForHeader = scrollYClamped.interpolate( {
    inputRange: [0, heightAboveToolbar + 10],
    // $FlowIgnore
    outputRange: [0, -heightAboveToolbar - 10]
  } );

  const setNumColumns = ( ) => {
    if ( layout === "list" || screenWidth <= 320 ) { return 1; }
    if ( screenWidth <= 744 ) { return 2; }
    if ( screenWidth <= 1024 ) { return 4; }
    return 6;
  };

  const numColumns = setNumColumns( );
  const combinedGutterWidth = ( numColumns + 1 ) * GUTTER;
  const gridItemWidth = Math.round(
    ( screenWidth - combinedGutterWidth ) / numColumns
  );

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
      uploadStatus={uploadStatus}
      setShowLoginSheet={setShowLoginSheet}
    />
  );

  const renderEmptyList = ( ) => <MyObservationsEmpty isLoading={isLoading} />;

  const renderItemSeparator = ( ) => {
    if ( layout === "grid" ) {
      return null;
    }
    return <View className="border-b border-lightGray" />;
  };

  const renderFooter = ( ) => (
    <InfiniteScrollLoadingWheel
      isLoading={isLoading}
      currentUser={currentUser}
    />
  );

  return (
    <>
      <ViewWrapper>
        <View className="overflow-hidden">
          <Animated.View
            style={[
              {
                transform: [{ translateY: offsetForHeader }],
                height: screenHeight
              }
            ]}
          >
            <Header
              setLayout={setLayout}
              layout={layout}
              currentUser={currentUser}
              numObservations={observations.length}
              setHeightAboveToolbar={setHeightAboveToolbar}
              uploadStatus={uploadStatus}
              setShowLoginSheet={setShowLoginSheet}
            />
            <AnimatedFlashList
              contentContainerStyle={{
                paddingLeft: GUTTER / 2,
                paddingRight: GUTTER / 2
              }}
              data={observations}
              key={numColumns}
              estimatedItemSize={layout === "grid" ? 165 : 98}
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
              refreshing={isLoading}
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
