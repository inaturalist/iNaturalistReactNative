import { useNetInfo } from "@react-native-community/netinfo";
import { useRoute } from "@react-navigation/native";
import ObsDetailsDefaultModeContainer
  from "components/ObsDetailsDefaultMode/ObsDetailsDefaultModeContainer";
import React, { useMemo, useState } from "react";
import Observation from "realmModels/Observation";
import {
  useCurrentUser,
  useLocalObservation,
  useRemoteObservation
} from "sharedHooks";

import SavedMatchContainer from "./SavedMatch/SavedMatchContainer";

type RouteParams = {
    targetActivityItemID?: number,
    uuid: string,
}

const ObsDetailsDefaultModeScreensWrapper = () => {
  const { params } = useRoute();
  const {
    targetActivityItemID,
    uuid
  } = params as RouteParams;
  const currentUser = useCurrentUser( );
  const isConnected = !!useNetInfo( ).isConnected;

  const [remoteObsWasDeleted, setRemoteObsWasDeleted] = useState( false );

  const {
    localObservation,
    markDeletedLocally,
    markViewedLocally
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
    fetchRemoteObservationError
  } = useRemoteObservation( uuid, fetchRemoteObservationEnabled );

  const observation = localObservation || Observation.mapApiToRealm( remoteObservation );

  // In theory the only situation in which an observation would not have a
  // user is when a user is not signed but has made a new observation in the
  // app. Also in theory that user should not be able to get to ObsDetail for
  // those observations, just ObsEdit. But.... let's be safe.
  const belongsToCurrentUser = (
    observation?.user?.id === currentUser?.id
    || ( !observation?.user && !observation?.id )
  );

  const showSavedMatch = useMemo( () => (
    // Saved match screen is used when:
    // 1. It's the current user's observation (or an observation being created)
    // 2. AND the observation hasn't been synced yet
    !!( ( belongsToCurrentUser || !observation?.user )
      && localObservation
      && !localObservation.wasSynced() )
  ), [belongsToCurrentUser, localObservation, observation?.user] );

  if ( showSavedMatch ) {
    return (
      <SavedMatchContainer
        observation={observation}
      />
    );
  }

  return (
    <ObsDetailsDefaultModeContainer
      observation={observation}
      targetActivityItemID={targetActivityItemID}
      uuid={uuid}
      localObservation={localObservation}
      markViewedLocally={markViewedLocally}
      markDeletedLocally={markDeletedLocally}
      remoteObservation={remoteObservation}
      remoteObsWasDeleted={remoteObsWasDeleted}
      setRemoteObsWasDeleted={setRemoteObsWasDeleted}
      fetchRemoteObservationError={fetchRemoteObservationError}
      currentUser={currentUser}
      belongsToCurrentUser={belongsToCurrentUser}
      isRefetching={isRefetching}
      refetchRemoteObservation={refetchRemoteObservation}
      isConnected={isConnected}
    />
  );
};

export default ObsDetailsDefaultModeScreensWrapper;
