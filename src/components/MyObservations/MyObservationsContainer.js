// @flow

import type { Node } from "react";
import React, { useState } from "react";
import useInfiniteScroll from "sharedHooks/useInfiniteScroll";
import useLocalObservations from "sharedHooks/useLocalObservations";

import MyObservations from "./MyObservations";

const MyObservationsContainer = ( ): Node => {
  const { observationList: observations } = useLocalObservations( );
  const [layout, setLayout] = useState( "list" );
  const [idBelow, setIdBelow] = useState( null );
  const isLoading = useInfiniteScroll( idBelow );

  return (
    <MyObservations
      observations={observations}
      layout={layout}
      setLayout={setLayout}
      isLoading={isLoading}
      onEndReached={( ) => {
        // infinite scroll
        if ( !isLoading ) {
          setIdBelow( observations[observations.length - 1].id );
        }
      }}
    />
  );
};

export default MyObservationsContainer;
