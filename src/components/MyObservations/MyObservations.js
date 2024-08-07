// @flow
import MyObservationsHeader from "components/MyObservations/MyObservationsHeader";
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
  handleIndividualUploadPress: Function,
  handleSyncButtonPress: Function,
  isFetchingNextPage: boolean,
  isConnected: boolean,
  layout: "list" | "grid",
  observations: Array<Object>,
  onEndReached: Function,
  setShowLoginSheet: Function,
  showLoginSheet: boolean,
  status: string,
  toggleLayout: Function
};

const MyObservations = ( {
  currentUser,
  handleIndividualUploadPress,
  handleSyncButtonPress,
  isFetchingNextPage,
  isConnected,
  layout,
  observations,
  onEndReached,
  setShowLoginSheet,
  showLoginSheet,
  status,
  toggleLayout
}: Props ): Node => (
  <>
    <ViewWrapper>
      <ScrollableWithStickyHeader
        renderHeader={setStickyAt => (
          <MyObservationsHeader
            handleSyncButtonPress={handleSyncButtonPress}
            currentUser={currentUser}
            hideToolbar={observations.length === 0}
            layout={layout}
            logInButtonNeutral={observations.length === 0}
            setHeightAboveToolbar={setStickyAt}
            toggleLayout={toggleLayout}
          />
        )}
        renderScrollable={onScroll => (
          <ObservationsFlashList
            dataCanBeFetched={!!currentUser}
            data={observations.filter( o => o.isValid() )}
            handleIndividualUploadPress={handleIndividualUploadPress}
            handleScroll={onScroll}
            hideLoadingWheel={!isFetchingNextPage || !currentUser}
            isFetchingNextPage={isFetchingNextPage}
            isConnected={isConnected}
            layout={layout}
            onEndReached={onEndReached}
            showObservationsEmptyScreen
            status={status}
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

export default MyObservations;
