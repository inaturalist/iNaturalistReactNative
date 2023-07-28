// @flow
import Header from "components/MyObservations/Header";
import { ObservationsFlashList, ViewWrapper } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useRef, useState } from "react";
import { Animated, Platform } from "react-native";
import { useDeviceOrientation } from "sharedHooks";

import LoginSheet from "./LoginSheet";
import MyObservationsEmpty from "./MyObservationsEmpty";

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
    isTablet,
    screenHeight,
    screenWidth
  } = useDeviceOrientation( );
  const [heightAboveToolbar, setHeightAboveToolbar] = useState( 0 );

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

  const renderEmptyList = ( ) => <MyObservationsEmpty isFetchingNextPage={isFetchingNextPage} />;

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
            <ObservationsFlashList
              isFetchingNextPage={isFetchingNextPage}
              layout={layout}
              observations={observations}
              onEndReached={onEndReached}
              allObsToUpload={allObsToUpload}
              currentUser={currentUser}
              testID="MyObservationsAnimatedList"
              handleScroll={handleScroll}
              renderEmptyList={renderEmptyList}
              data={observations.filter( o => o.isValid() )}
            />
          </Animated.View>
        </View>
      </ViewWrapper>
      {showLoginSheet && <LoginSheet setShowLoginSheet={setShowLoginSheet} />}
    </>
  );
};

export default MyObservations;
