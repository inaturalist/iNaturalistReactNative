// @flow
import Header from "components/MyObservations/Header";
import {
  ObservationsFlashList,
  ScrollableWithStickyHeader,
  ViewWrapper
} from "components/SharedComponents";
import type { Node } from "react";
import React from "react";

import Announcements from "./Announcements";
import LoginSheet from "./LoginSheet";

type Props = {
  checkUserCanUpload: Function,
  currentUser: Object,
  isFetchingNextPage: boolean,
  isOnline: boolean,
  layout: "list" | "grid",
  observations: Array<Object>,
  onEndReached: Function,
  setShowLoginSheet: Function,
  showLoginSheet: boolean,
  status: string,
  syncInProgress: boolean,
  syncObservations: Function,
  toggleLayout: Function
};

const MyObservations = ( {
  checkUserCanUpload,
  currentUser,
  isFetchingNextPage,
  isOnline,
  layout,
  observations,
  onEndReached,
  setShowLoginSheet,
  showLoginSheet,
  status,
  syncInProgress,
  syncObservations,
  toggleLayout
}: Props ): Node => (
  <>
    <ViewWrapper>
      <ScrollableWithStickyHeader
        renderHeader={setStickyAt => (
          <Header
            checkUserCanUpload={checkUserCanUpload}
            currentUser={currentUser}
            hideToolbar={observations.length === 0}
            layout={layout}
            logInButtonNeutral={observations.length === 0}
            setHeightAboveToolbar={setStickyAt}
            syncInProgress={syncInProgress}
            syncObservations={syncObservations}
            toggleLayout={toggleLayout}
          />
        )}
        renderScrollable={onScroll => (
          <ObservationsFlashList
            checkUserCanUpload={checkUserCanUpload}
            dataCanBeFetched={!!currentUser}
            data={observations.filter( o => o.isValid() )}
            handleScroll={onScroll}
            hideLoadingWheel={!isFetchingNextPage || !currentUser}
            isFetchingNextPage={isFetchingNextPage}
            isOnline={isOnline}
            layout={layout}
            onEndReached={onEndReached}
            showObservationsEmptyScreen
            status={status}
            testID="MyObservationsAnimatedList"
            renderHeader={(
              <Announcements isOnline={isOnline} />
            )}
          />
        )}
      />
    </ViewWrapper>
    {showLoginSheet && <LoginSheet setShowLoginSheet={setShowLoginSheet} />}
  </>
);

export default MyObservations;
