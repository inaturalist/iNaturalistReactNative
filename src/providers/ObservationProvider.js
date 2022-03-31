// @flow
import React from "react";
import type { Node } from "react";

import { ObservationContext } from "./contexts";
import useObservations from "./hooks/useObservations";

type Props = {
  children: any
}

const ObservationProvider = ( { children }: Props ): Node => {
  const observationValue = useObservations( );

  return (
    <ObservationContext.Provider value={observationValue}>
      {children}
    </ObservationContext.Provider>
  );
};

export default ObservationProvider;
