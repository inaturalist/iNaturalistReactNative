// @flow
import Header from "components/MyObservations/Header";
import { ObservationsFlashList, StickyView, ViewWrapper } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useRef, useState } from "react";
import { Animated, Platform } from "react-native";

import Announcements from "./Announcements";
import LoginSheet from "./LoginSheet";

type Props = {
  currentUser: Object,
  isFetchingNextPage: boolean,
  isOnline: boolean,
  layout: "list" | "grid",
  observations: Array<Object>,
  onEndReached: Function,
  setShowLoginSheet: Function,
  showLoginSheet: boolean,
  status: string,
  stopUploads: Function,
  syncObservations: Function,
  toggleLayout: Function,
  toolbarProgress: number,
  uploadMultipleObservations: Function,
  uploadSingleObservation: Function,
  uploadState: Object
};

const MyObservations = ( {
  currentUser,
  isFetchingNextPage,
  isOnline,
  layout,
  observations,
  onEndReached,
  setShowLoginSheet,
  showLoginSheet,
  status,
  stopUploads,
  syncObservations,
  toggleLayout,
  toolbarProgress,
  uploadMultipleObservations,
  uploadSingleObservation,
  uploadState
}: Props ): Node => {
  const [heightAboveToolbar, setHeightAboveToolbar] = useState( 0 );

  const [hideHeaderCard, setHideHeaderCard] = useState( false );
  const [yValue, setYValue] = useState( 0 );
  // basing collapsible sticky header code off the example in this article
  // https://medium.com/swlh/making-a-collapsible-sticky-header-animations-with-react-native-6ad7763875c3
  const scrollY = useRef( new Animated.Value( 0 ) );

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
          <StickyView scrollY={scrollY} heightAboveView={heightAboveToolbar}>
            <Header
              currentUser={currentUser}
              hideToolbar={observations.length === 0}
              layout={layout}
              setHeightAboveToolbar={setHeightAboveToolbar}
              stopUploads={stopUploads}
              syncObservations={syncObservations}
              toggleLayout={toggleLayout}
              toolbarProgress={toolbarProgress}
              uploadMultipleObservations={uploadMultipleObservations}
              uploadState={uploadState}
            />
            <ObservationsFlashList
              dataCanBeFetched={!!currentUser}
              data={observations.filter( o => o.isValid() )}
              handleScroll={handleScroll}
              hideLoadingWheel={!isFetchingNextPage || !currentUser}
              isFetchingNextPage={isFetchingNextPage}
              isOnline={isOnline}
              layout={layout}
              onEndReached={onEndReached}
              showObservationsEmptyScreen
              status={status}
              testID="MyObservationsAnimatedList"
              uploadSingleObservation={uploadSingleObservation}
              uploadState={uploadState}
              renderHeader={(
                <Announcements currentUser={currentUser} isOnline={isOnline} />
              )}
            />
          </StickyView>
        </View>
      </ViewWrapper>
      {showLoginSheet && <LoginSheet setShowLoginSheet={setShowLoginSheet} />}
    </>
  );
};

export default MyObservations;
