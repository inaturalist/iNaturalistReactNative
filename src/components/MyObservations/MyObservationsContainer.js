// @flow

import type { Node } from "react";
import React, { useState } from "react";
import useLocalObservations from "sharedHooks/useLocalObservations";

import MyObservations from "./MyObservations";

const MyObservationsContainer = ( ): Node => {
  const { observationList: observations } = useLocalObservations( );
  const [layout, setLayout] = useState( "list" );

  return (
    <MyObservations
      observations={observations}
      layout={layout}
      setLayout={setLayout}
      onEndReached={() => {
        console.log( "just here to placate flow" );
        // TODO integrate infinite scroll
        // if ( !isLoading ) {
        //   setIdBelow( observations[observations.length - 1].id );
        // }
      }}
    />
  );
};

export default MyObservationsContainer;
