// @flow
import IdentificationSheets from "components/ObsDetailsDefaultMode/IdentificationSheets";
import useMarkViewedMutation
  from "components/ObsDetailsSharedComponents/hooks/useMarkViewedMutation";
import useObsDetailsSharedLogic
  from "components/ObsDetailsSharedComponents/hooks/useObsDetailsSharedLogic";
import type { Node } from "react";
import React from "react";
import { LogBox } from "react-native";

import ObsDetailsDefaultMode from "./ObsDetailsDefaultMode";

// this is getting triggered by passing dates, like _created_at, through
// react navigation via the observation object. it doesn't seem to
// actually be breaking anything, for the moment (May 2, 2022)
LogBox.ignoreLogs( [
  "Non-serializable values were found in the navigation state",
] );

type Props = {
  belongsToCurrentUser: boolean,
  currentUser: ?Object,
  fetchRemoteObservationError: ?Object,
  isConnected: boolean,
  isRefetching: boolean,
  localObservation: ?Object,
  markDeletedLocally: Function,
  markViewedLocally: Function,
  observation: Object,
  refetchRemoteObservation: Function,
  remoteObservation: ?Object,
  remoteObsWasDeleted: boolean,
  setRemoteObsWasDeleted: Function,
  targetActivityItemID?: ?number,
  uuid: string
}

const ObsDetailsDefaultModeContainer = ( props: Props ): Node => {
  const {
    observation,
    targetActivityItemID,
    uuid,
    localObservation,
    markViewedLocally,
    markDeletedLocally,
    remoteObservation,
    setRemoteObsWasDeleted,
    fetchRemoteObservationError,
    currentUser,
    belongsToCurrentUser,
    isRefetching,
    refetchRemoteObservation,
    isConnected,
    remoteObsWasDeleted,
  } = props;

  useMarkViewedMutation( localObservation, markViewedLocally, remoteObservation );

  const {
    activityItems,
    addingActivityItem,
    agreeIdentification,
    observationShown,
    showAddCommentSheet,
    showAgreeWithIdSheet,
    subscriptionResults,
    wasSynced,
    openAddCommentSheet,
    hideAddCommentSheet,
    openAgreeWithIdSheet,
    closeAgreeWithIdSheet,
    navToSuggestions,
    invalidateQueryAndRefetch,
    handleIdentificationMutationSuccess,
    handleCommentMutationSuccess,
    confirmRemoteObsWasDeleted,
    loadActivityItem,
    refetchSubscriptions,
  } = useObsDetailsSharedLogic( {
    observation,
    uuid,
    targetActivityItemID,
    localObservation,
    remoteObservation,
    markViewedLocally,
    markDeletedLocally,
    setRemoteObsWasDeleted,
    fetchRemoteObservationError,
    currentUser,
    belongsToCurrentUser,
    isRefetching,
    refetchRemoteObservation,
    isConnected,
    remoteObsWasDeleted,
  } );

  return observationShown && (
    <>
      <ObsDetailsDefaultMode
        activityItems={activityItems}
        addingActivityItem={addingActivityItem}
        belongsToCurrentUser={belongsToCurrentUser}
        currentUser={currentUser}
        isConnected={isConnected}
        navToSuggestions={navToSuggestions}
        observation={observationShown}
        openAddCommentSheet={openAddCommentSheet}
        openAgreeWithIdSheet={openAgreeWithIdSheet}
        refetchRemoteObservation={invalidateQueryAndRefetch}
        refetchSubscriptions={refetchSubscriptions}
        showAddCommentSheet={showAddCommentSheet}
        subscriptions={subscriptionResults}
        targetActivityItemID={targetActivityItemID}
        wasSynced={wasSynced}
        uuid={uuid}
      />
      <IdentificationSheets
        agreeIdentification={agreeIdentification}
        closeAgreeWithIdSheet={closeAgreeWithIdSheet}
        confirmRemoteObsWasDeleted={confirmRemoteObsWasDeleted}
        handleCommentMutationSuccess={handleCommentMutationSuccess}
        handleIdentificationMutationSuccess={handleIdentificationMutationSuccess}
        hideAddCommentSheet={hideAddCommentSheet}
        loadActivityItem={loadActivityItem}
        observation={observationShown}
        remoteObsWasDeleted={remoteObsWasDeleted}
        showAddCommentSheet={showAddCommentSheet}
        showAgreeWithIdSheet={showAgreeWithIdSheet}
      />
    </>
  );
};

export default ObsDetailsDefaultModeContainer;
