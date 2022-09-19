// @flow

import type { Node } from "react";
import React from "react";

import ObservationViews from "../SharedComponents/ObservationViews/ObservationViews";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import useLocalObservations from "./hooks/useLocalObservations";
import useRemoteObservations from "./hooks/useRemoteObservations";
import TopCard from "./TopCard";

const ObsList = ( ): Node => {
  const localObservations = useLocalObservations( );
  const { observationList, unuploadedObsList } = localObservations;
  const {
    loading,
    syncObservations,
    fetchNextObservations
  } = useRemoteObservations( );

  const numOfUnuploadedObs = unuploadedObsList?.length;

  return (
    <ViewWithFooter>
      <TopCard numOfUnuploadedObs={numOfUnuploadedObs} />
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
