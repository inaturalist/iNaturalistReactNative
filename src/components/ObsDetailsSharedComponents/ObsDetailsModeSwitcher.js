// @flow
import ObsDetails from "components/ObsDetails/ObsDetails";
import type { Node } from "react";
import React from "react";
import {
  useLayoutPrefs,
  useTranslation,
} from "sharedHooks";
import { OBS_DETAILS_TAB } from "stores/createLayoutSlice";

const ObsDetailsModeSwitcher = ( props ): Node => {
  const {
    activityItems,
    addingActivityItem,
    belongsToCurrentUser,
    currentUser,
    isConnected,
    navToSuggestions,
    observation,
    openAddCommentSheet,
    openAgreeWithIdSheet,
    refetchRemoteObservation,
    refetchSubscriptions,
    showAddCommentSheet,
    subscriptions,
    uuid,
  } = props;

  const {
    obsDetailsTab,
    setObsDetailsTab,
  } = useLayoutPrefs( );

  const { t } = useTranslation( );

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

  return (
    observation && (
      <ObsDetails
        activityItems={activityItems}
        addingActivityItem={addingActivityItem}
        belongsToCurrentUser={belongsToCurrentUser}
        currentUser={currentUser}
        isConnected={isConnected}
        navToSuggestions={navToSuggestions}
        observation={observation}
        openAddCommentSheet={openAddCommentSheet}
        openAgreeWithIdSheet={openAgreeWithIdSheet}
        refetchRemoteObservation={refetchRemoteObservation}
        refetchSubscriptions={refetchSubscriptions}
        showAddCommentSheet={showAddCommentSheet}
        subscriptions={subscriptions}
        uuid={uuid}
        obsDetailsTab={obsDetailsTab}
        showActivityTab={showActivityTab}
        tabs={tabs}
      />
    )
  );
};

export default ObsDetailsModeSwitcher;
