// @flow

import React from "react";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import type { Node } from "react";
import useObservations from "./hooks/useObservations";
import GridView from "./GridView";

const Identify = ( ): Node => {
  const { observations, loading } = useObservations( );

  console.log( observations, "observations in identify" );

  return (
    <ViewWithFooter>
      <GridView
        loading={loading}
        observationList={observations}
        testID="Identify.observationGrid"
      />
    </ViewWithFooter>
  );
};

export default Identify;
