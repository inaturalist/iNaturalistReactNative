// @flow

import React, { useContext } from "react";
import type { Node } from "react";

import useFetchObservations from "./hooks/fetchObservations";
import ObsList from "./ObsList";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { ObservationContext } from "../../providers/contexts";

const Observations = ( ): Node => {
  const { observationList, setObservation } = useContext( ObservationContext );
  // this custom hook fetches on first component render
  // (and anytime you save while in debug - hot reloading mode )
  useFetchObservations( );

  useEffect( ( ) => {
    const unsub = navigation.addListener( "focus", ( ) => {
      fetchObservations( );
    } );

    return unsub;
  } );

  return (
    <ViewWithFooter>
      <ObsList observations={observationList} setObservation={setObservation} />
    </ViewWithFooter>
  );
};

export default Observations;
