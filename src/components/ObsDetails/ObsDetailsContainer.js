// @flow
import {
  useNetInfo,
} from "@react-native-community/netinfo";
import { useRoute } from "@react-navigation/native";
import IdentificationSheets from "components/ObsDetailsDefaultMode/IdentificationSheets";
import useMarkViewedMutation
  from "components/ObsDetailsSharedComponents/hooks/useMarkViewedMutation";
import useObsDetailsSharedLogic
  from "components/ObsDetailsSharedComponents/hooks/useObsDetailsSharedLogic";
import type { Node } from "react";
import React, {
  useState,
} from "react";
import { LogBox } from "react-native";
import Observation from "realmModels/Observation";
import {
  useCurrentUser,
  useLayoutPrefs,
  useLocalObservation,
  useTranslation,
} from "sharedHooks";
import useRemoteObservation from "sharedHooks/useRemoteObservation";
import { OBS_DETAILS_TAB } from "stores/createLayoutSlice";

import ObsDetails from "./ObsDetails";

// this is getting triggered by passing dates, like _created_at, through
// react navigation via the observation object. it doesn't seem to
// actually be breaking anything, for the moment (May 2, 2022)
LogBox.ignoreLogs( [
  "Non-serializable values were found in the navigation state",
] );

const ObsDetailsContainer = ( ): Node => {
  const {
    obsDetailsTab,
    setObsDetailsTab,
  } = useLayoutPrefs( );
  const currentUser = useCurrentUser( );
  const { params } = useRoute();
  const {
    targetActivityItemID,
    uuid,
  } = params;
  const { t } = useTranslation( );
  const { isConnected } = useNetInfo( );
  const [remoteObsWasDeleted, setRemoteObsWasDeleted] = useState( false );

  const {
    localObservation,
    markDeletedLocally,
    markViewedLocally,
  } = useLocalObservation( uuid );

  const fetchRemoteObservationEnabled = !!(
    !remoteObsWasDeleted
    && ( !localObservation || localObservation?.wasSynced( ) )
    && isConnected
  );

  const {
    remoteObservation,
    refetchRemoteObservation,
    isRefetching,
    fetchRemoteObservationError,
  } = useRemoteObservation( uuid, fetchRemoteObservationEnabled );

  useMarkViewedMutation( localObservation, markViewedLocally, remoteObservation );

  const observation = localObservation || Observation.mapApiToRealm( remoteObservation );

  // In theory the only situation in which an observation would not have a
  // user is when a user is not signed but has made a new observation in the
  // app. Also in theory that user should not be able to get to ObsDetail for
  // those observations, just ObsEdit. But.... let's be safe.
  const belongsToCurrentUser = (
    observation?.user?.id === currentUser?.id
    || ( !observation?.user && !observation?.id )
  );

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
        targetActivityItemID={targetActivityItemID}
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
