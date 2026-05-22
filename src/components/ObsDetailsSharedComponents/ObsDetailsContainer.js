// @flow
import ObsDetails from "components/ObsDetails/ObsDetails";
import IdentificationSheets from "components/ObsDetailsDefaultMode/IdentificationSheets";
import useMarkViewedMutation
  from "components/ObsDetailsSharedComponents/hooks/useMarkViewedMutation";
import useObsDetailsSharedLogic
  from "components/ObsDetailsSharedComponents/hooks/useObsDetailsSharedLogic";
import type { Node } from "react";
import React from "react";
import {
  useLayoutPrefs,
  useTranslation,
} from "sharedHooks";
import { OBS_DETAILS_TAB } from "stores/createLayoutSlice";

const ObsDetailsContainer = ( props ): Node => {
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

  const {
    obsDetailsTab,
    setObsDetailsTab,
  } = useLayoutPrefs( );

  const { t } = useTranslation( );

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

  const tabs = [
    {
      id: OBS_DETAILS_TAB.ACTIVITY,
      testID: "ObsDetails.ActivityTab",
      onPress: ( ) => setObsDetailsTab( OBS_DETAILS_TAB.ACTIVITY ),
      text: t( "ACTIVITY" ),
    },
    {
      id: OBS_DETAILS_TAB.DETAILS,
      testID: "ObsDetails.DetailsTab",
      onPress: () => setObsDetailsTab( OBS_DETAILS_TAB.DETAILS ),
      text: t( "DETAILS" ),
    },
  ];

  const showActivityTab = obsDetailsTab === OBS_DETAILS_TAB.ACTIVITY;

  return observationShown && (
    <>
      <ObsDetails
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
        obsDetailsTab={obsDetailsTab}
        showActivityTab={showActivityTab}
        tabs={tabs}
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
