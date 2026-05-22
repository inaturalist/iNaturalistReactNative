// @flow
import IdentificationSheets from "components/ObsDetailsDefaultMode/IdentificationSheets";
import useMarkViewedMutation
  from "components/ObsDetailsSharedComponents/hooks/useMarkViewedMutation";
import useObsDetailsSharedLogic
  from "components/ObsDetailsSharedComponents/hooks/useObsDetailsSharedLogic";
import ObsDetailsModeSwitcher from "components/ObsDetailsSharedComponents/ObsDetailsModeSwitcher";
import type { Node } from "react";
import React from "react";

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
  uuid: string,
};

const ObsDetailsContainer = ( props: Props ): Node => {
  const {
    observation,
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
  } );

  return observationShown && (
    <>
      <ObsDetailsModeSwitcher
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

export default ObsDetailsContainer;
