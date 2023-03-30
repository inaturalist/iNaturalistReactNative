// @flow

import type { Node } from "react";
import React, { useState } from "react";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useInfiniteScroll from "sharedHooks/useInfiniteScroll";
import useLocalObservations from "sharedHooks/useLocalObservations";
import useUploadObservations from "sharedHooks/useUploadObservations";

import MyObservations from "./MyObservations";

const MyObservationsContainer = ( ): Node => {
  const { observationList: observations, allObsToUpload } = useLocalObservations( );
  const uploadStatus = useUploadObservations( allObsToUpload );
  const [layout, setLayout] = useState( "list" );
  const [idBelow, setIdBelow] = useState( null );
  const isLoading = useInfiniteScroll( idBelow );
  const [showLoginSheet, setShowLoginSheet] = useState( false );
  const currentUser = useCurrentUser( );

  return (
    <MyObservations
      observations={observations}
      layout={layout}
      setLayout={setLayout}
      isLoading={isLoading}
      uploadStatus={uploadStatus}
      currentUser={currentUser}
      showLoginSheet={showLoginSheet}
      setShowLoginSheet={setShowLoginSheet}
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
