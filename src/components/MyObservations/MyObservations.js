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
}: Props ): Node => (
  <>
    <ViewWrapper>
      <ScrollableWithStickyHeader
        renderHeader={setStickyAt => (
          <Header
            currentUser={currentUser}
            hideToolbar={observations.length === 0}
            layout={layout}
            setHeightAboveToolbar={setStickyAt}
            stopUploads={stopUploads}
            syncObservations={syncObservations}
            toggleLayout={toggleLayout}
            toolbarProgress={toolbarProgress}
            uploadMultipleObservations={uploadMultipleObservations}
            uploadState={uploadState}
          />
        )}
        renderScrollable={onSroll => (
          <ObservationsFlashList
            dataCanBeFetched={!!currentUser}
            data={observations.filter( o => o.isValid() )}
            handleScroll={onSroll}
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
        )}
      />
    </ViewWrapper>
    {showLoginSheet && <LoginSheet setShowLoginSheet={setShowLoginSheet} />}
  </>
);

export default MyObservations;
