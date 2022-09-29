// @flow

import ObservationViews from "components/SharedComponents/ObservationViews/ObservationViews";
import ViewWithFooter from "components/SharedComponents/ViewWithFooter";
import type { Node } from "react";
import React from "react";

import useLocalObservations from "./hooks/useLocalObservations";
import useRemoteObservations from "./hooks/useRemoteObservations";

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
        handleEndReached={( ) => fetchNextObservations( observationList.length )}
        syncObservations={syncObservations}
      />
    </ViewWithFooter>
  );
};

export default ObsList;
