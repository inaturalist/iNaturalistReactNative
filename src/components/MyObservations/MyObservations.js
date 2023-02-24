// @flow
import MyObservationsHeader from "components/MyObservations/MyObservationsHeader";
import ObsGridItem from "components/Observations/ObsGridItem";
import ObsListItem from "components/Observations/ObsListItem";
import ViewWithFooter from "components/SharedComponents/ViewWithFooter";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useRef, useState } from "react";
import { Animated, Dimensions } from "react-native";
import useCurrentUser from "sharedHooks/useCurrentUser";

import InfiniteScrollLoadingWheel from "./InfiniteScrollLoadingWheel";
import MyObservationsEmpty from "./MyObservationsEmpty";
import MyObservationsLoginSheet from "./MyObservationsLoginSheet";
import MyObservationsPressable from "./MyObservationsPressable";

const { diffClamp } = Animated;

type Props = {
  isLoading?: bool,
  layout: "list" | "grid",
  observations: Array<Object>,
  onEndReached: Function,
  setLayout: Function
}

const {
  width: screenWidth,
  height: screenHeight
} = Dimensions.get( "screen" );
const GUTTER = 5;

const MyObservations = ( {
  isLoading,
  layout,
  observations,
  onEndReached,
  setLayout
}: Props ): Node => {
  const currentUser = useCurrentUser( );
  const HEADER_HEIGHT = currentUser ? 101 : 154;

  const [hideHeaderCard, setHideHeaderCard] = useState( false );
  const [yValue, setYValue] = useState( 0 );
  // basing collapsible sticky header code off the example in this article
  // https://medium.com/swlh/making-a-collapsible-sticky-header-animations-with-react-native-6ad7763875c3
  const scrollY = useRef( new Animated.Value( 0 ) );
  const scrollYClamped = diffClamp( scrollY.current, 0, HEADER_HEIGHT );

  const offsetForHeader = scrollYClamped.interpolate( {
    inputRange: [0, HEADER_HEIGHT],
    // $FlowIgnore
    outputRange: [0, -HEADER_HEIGHT]
  } );

  const numColumns = layout === "grid" ? 2 : 1;
  const combinedGutterWidth = ( numColumns + 1 ) * GUTTER;
  const gridItemWidth = Math.round( ( screenWidth - combinedGutterWidth ) / numColumns );

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
        if ( hide !== hideHeaderCard ) {
          setHideHeaderCard( hide );
          setYValue( y );
        }
      },
      useNativeDriver: true
    }
  );

  return (
    <>
      <ViewWithFooter>
        <Animated.View style={[{ transform: [{ translateY: offsetForHeader }] }]}>
          <Animated.FlatList
            data={observations}
            key={layout === "grid" ? 1 : 0}
            style={{ height: screenHeight }}
            testID="MyObservations"
            numColumns={numColumns}
            renderItem={( { item } ) => (
              <MyObservationsPressable observation={item}>
                {
                layout === "grid"
                  // TODO: this doesn't actually work, I think b/c this style
                  // needs to be static; haven't come up with a good way
                  // around that, though. Maybe we can punt on it until
                  // dealing with different screen sizes ~~~kueda 20230222
                  ? <ObsGridItem observation={item} width={`w-[${gridItemWidth}px]`} />
                  : <ObsListItem observation={item} />
              }
              </MyObservationsPressable>
            )}
            ListEmptyComponent={
              <MyObservationsEmpty isLoading={isLoading} />
            }
            ListHeaderComponent={(
              <MyObservationsHeader
                setLayout={setLayout}
                layout={layout}
                hideHeaderCard={hideHeaderCard}
                currentUser={currentUser}
              />
            )}
            ItemSeparatorComponent={
              layout !== "grid" && <View className="border-b border-lightGray" />
            }
            ListFooterComponent={
              <InfiniteScrollLoadingWheel isLoading={isLoading} currentUser={currentUser} />
            }
            stickyHeaderIndices={[0]}
            bounces={false}
            initialNumToRender={10}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.1}
            onScroll={handleScroll}
          />
        </Animated.View>
      </ViewWithFooter>
      <MyObservationsLoginSheet />
    </>
  );
};

export default MyObservations;
