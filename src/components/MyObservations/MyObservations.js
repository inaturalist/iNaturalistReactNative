// @flow
import MyObservationsHeader from "components/MyObservations/MyObservationsHeader";
import OnboardingCarouselModal from "components/Onboarding/OnboardingCarouselModal";
import {
  ObservationsFlashList,
  ScrollableWithStickyHeader,
  ViewWrapper
} from "components/SharedComponents";
import type { Node } from "react";
import React, { useState } from "react";
import { storage } from "stores/useStore";

import Announcements from "./Announcements";
import LoginSheet from "./LoginSheet";

type Props = {
  currentUser: Object,
  handleIndividualUploadPress: Function,
  handleSyncButtonPress: Function,
  isConnected: boolean,
  isFetchingNextPage: boolean,
  layout: "list" | "grid",
  listRef?: Object,
  numUnuploadedObservations: number,
  observations: Array<Object>,
  onEndReached: Function,
  onListLayout?: Function,
  onScroll?: Function,
  setShowLoginSheet: Function,
  showLoginSheet: boolean,
  status: string,
  toggleLayout: Function
};

const ONBOARDING_SHOWN = "onBoardingShown";

const MyObservations = ( {
  currentUser,
  handleIndividualUploadPress,
  handleSyncButtonPress,
  isConnected,
  isFetchingNextPage,
  layout,
  listRef,
  numUnuploadedObservations,
  observations,
  onEndReached,
  onListLayout,
  onScroll,
  setShowLoginSheet,
  showLoginSheet,
  status,
  toggleLayout
}: Props ): Node => {
  const [showOnboarding, setShowOnboarding] = useState( !storage.getBoolean( ONBOARDING_SHOWN ) );

  return (
    <>
      <ViewWrapper>
        <OnboardingCarouselModal
          showModal={showOnboarding}
          closeModal={() => {
            setShowOnboarding( false );
            storage.set( ONBOARDING_SHOWN, true );
          }}
        />
        <ScrollableWithStickyHeader
          onScroll={onScroll}
          renderHeader={setStickyAt => (
            <MyObservationsHeader
              currentUser={currentUser}
              handleSyncButtonPress={handleSyncButtonPress}
              hideToolbar={observations.length === 0}
              layout={layout}
              logInButtonNeutral={observations.length === 0}
              numUnuploadedObservations={numUnuploadedObservations}
              setHeightAboveToolbar={setStickyAt}
              toggleLayout={toggleLayout}
            />
          )}
          renderScrollable={animatedScrollEvent => (
            <ObservationsFlashList
              dataCanBeFetched={!!currentUser}
              data={observations.filter( o => o.isValid() )}
              handleIndividualUploadPress={handleIndividualUploadPress}
              onScroll={animatedScrollEvent}
              hideLoadingWheel={!isFetchingNextPage || !currentUser}
              isFetchingNextPage={isFetchingNextPage}
              isConnected={isConnected}
              layout={layout}
              onEndReached={onEndReached}
              onLayout={onListLayout}
              ref={listRef}
              showObservationsEmptyScreen
              showNoResults={( status === "success" && !!( currentUser ) ) || !currentUser}
              testID="MyObservationsAnimatedList"
              renderHeader={(
                <Announcements isConnected={isConnected} />
              )}
            />
          )}
        />
      </ViewWrapper>
      {showLoginSheet && <LoginSheet setShowLoginSheet={setShowLoginSheet} />}
    </>
  );
};

export default MyObservations;
