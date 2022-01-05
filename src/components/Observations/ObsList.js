// @flow

import React, { useContext } from "react";
import type { Node } from "react";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { ObservationContext } from "../../providers/contexts";
import ObservationViews from "../SharedComponents/ObservationViews/ObservationViews";

const ObsList = ( ): Node => {
  const { observationList, loading } = useContext( ObservationContext );

  return (
    <ViewWithFooter>
      <ObservationViews
        loading={loading}
        observationList={observationList}
        testID="ObsList.myObservations"
      />
    </ViewWithFooter>
  );
};

export default ObsList;
