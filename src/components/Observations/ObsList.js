// @flow

import ObservationViews from "components/Observations/ObservationViews";
import ViewWithFooter from "components/SharedComponents/ViewWithFooter";
import type { Node } from "react";
import React from "react";
import useLocalObservations from "sharedHooks/useLocalObservations";
import useRemoteObservations from "sharedHooks/useRemoteObservations";

const ObsList = ( ): Node => {
  const localObservations = useLocalObservations( );
  const { observationList } = localObservations;
  const {
    loading,
    syncObservations,
    fetchNextObservations
  } = useRemoteObservations( );

  return (
    <ViewWithFooter>
      <ObservationViews
        loading={loading}
        localObservations={localObservations}
        testID="ObsList.myObservations"
        // needs to be refactøred, fetches forever once all observations are fetched
        handleEndReached={( ) => fetchNextObservations( observationList.length )}
        syncObservations={syncObservations}
      />
    </ViewWithFooter>
  );
};

export default ObsList;
