// @flow
import Header from "components/MyObservations/Header";
import ViewWrapper from "components/SharedComponents/ViewWrapper";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useRef, useState } from "react";
import {
  Animated, Dimensions, Platform
} from "react-native";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useLocalObservations from "sharedHooks/useLocalObservations";
import useUploadObservations from "sharedHooks/useUploadObservations";

import InfiniteScrollLoadingWheel from "./InfiniteScrollLoadingWheel";
import LoginSheet from "./LoginSheet";
import MyObservationsEmpty from "./MyObservationsEmpty";
import MyObservationsPressable from "./MyObservationsPressable";
import ObsGridItem from "./ObsGridItem";
import ObsListItem from "./ObsListItem";

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
const GUTTER = 15;

const MyObservations = ( {
  isLoading,
  layout,
  observations,
  onEndReached,
  setLayout
}: Props ): Node => {
  const currentUser = useCurrentUser( );
  const [heightAboveToolbar, setHeightAboveToolbar] = useState( 0 );

  const [hideHeaderCard, setHideHeaderCard] = useState( false );
  const [yValue, setYValue] = useState( 0 );
  // basing collapsible sticky header code off the example in this article
  // https://medium.com/swlh/making-a-collapsible-sticky-header-animations-with-react-native-6ad7763875c3
  const scrollY = useRef( new Animated.Value( 0 ) );
  const scrollYClamped = diffClamp( scrollY.current, 0, heightAboveToolbar );

  const offsetForHeader = scrollYClamped.interpolate( {
    inputRange: [0, heightAboveToolbar],
    // $FlowIgnore
    outputRange: [0, -heightAboveToolbar]
  } );

  const setNumColumns = ( ) => {
    if ( layout === "list" || screenWidth <= 320 ) { return 1; }
    if ( screenWidth <= 744 ) { return 2; }
    if ( screenWidth <= 1024 ) { return 4; }
    return 6;
  };

  const numColumns = setNumColumns( );
  const combinedGutterWidth = ( numColumns + 1 ) * GUTTER;
  const gridItemWidth = Math.round( ( screenWidth - combinedGutterWidth ) / numColumns );

  const { allObsToUpload } = useLocalObservations( );
  const uploadStatus = useUploadObservations( allObsToUpload );

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

  return (
    <>
      <ViewWrapper>
        <Animated.View style={[{ transform: [{ translateY: offsetForHeader }] }]}>
          <Animated.FlatList
            data={observations}
            key={numColumns}
            // eslint-disable-next-line react-native/no-inline-styles
            contentContainerStyle={layout === "grid" && {
              alignItems: "center"
            }}
            style={{ height: screenHeight }}
            testID="MyObservationsAnimatedList"
            numColumns={setNumColumns( )}
            renderItem={( { item } ) => (
              <MyObservationsPressable observation={item}>
                {
                layout === "grid"
                  ? (
                    <ObsGridItem
                      observation={item}
                      // 03022023 it seems like Flatlist is designed to work
                      // better with RN styles than with Tailwind classes
                      style={{
                        height: gridItemWidth,
                        width: gridItemWidth,
                        margin: GUTTER / 2
                      }}
                      uploadStatus={uploadStatus}
                    />
                  ) : <ObsListItem observation={item} uploadStatus={uploadStatus} />
              }
              </MyObservationsPressable>
            )}
            ListEmptyComponent={
              <MyObservationsEmpty isLoading={isLoading} />
            }
            ListHeaderComponent={(
              <Header
                setLayout={setLayout}
                layout={layout}
                // hideHeaderCard={hideHeaderCard}
                currentUser={currentUser}
                numObservations={observations.length}
                setHeightAboveToolbar={setHeightAboveToolbar}
                uploadStatus={uploadStatus}
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
      </ViewWrapper>
      <LoginSheet />
    </>
  );
};

export default MyObservations;
