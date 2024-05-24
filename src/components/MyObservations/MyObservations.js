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
  syncInProgress: boolean,
  syncObservations: Function,
  toggleLayout: Function,
  uploadMultipleObservations: Function,
  uploadSingleObservation: Function
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
  syncInProgress,
  syncObservations,
  toggleLayout,
  uploadMultipleObservations,
  uploadSingleObservation
}: Props ): Node => (
  <>
    <ViewWrapper>
      <ScrollableWithStickyHeader
        renderHeader={setStickyAt => (
          <Header
            currentUser={currentUser}
            hideToolbar={observations.length === 0}
            layout={layout}
            logInButtonNeutral={observations.length === 0}
            setHeightAboveToolbar={setStickyAt}
            stopUploads={stopUploads}
            syncInProgress={syncInProgress}
            syncObservations={syncObservations}
            toggleLayout={toggleLayout}
            uploadMultipleObservations={uploadMultipleObservations}
          />
        )}
        renderScrollable={onScroll => (
          <ObservationsFlashList
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
            uploadSingleObservation={uploadSingleObservation}
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
