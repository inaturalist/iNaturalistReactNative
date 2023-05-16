// @flow

import type { Node } from "react";
import React, { useState } from "react";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useInfiniteScroll from "sharedHooks/useInfiniteScroll";
import useLocalObservations from "sharedHooks/useLocalObservations";
import useObservationsUpdates from "sharedHooks/useObservationsUpdates";
import useUploadObservations from "sharedHooks/useUploadObservations";

import MyObservations from "./MyObservations";

const MyObservationsContainer = (): Node => {
  const { observationList: observations, allObsToUpload } = useLocalObservations();
  const uploadStatus = useUploadObservations( allObsToUpload );
  const [layout, setLayout] = useState( "list" );
  const { isLoading, fetchNextPage } = useInfiniteScroll();
  const [showLoginSheet, setShowLoginSheet] = useState( false );
  const currentUser = useCurrentUser();
  useObservationsUpdates( !!currentUser );

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
      onEndReached={fetchNextPage}
    />
  );
};

export default MyObservationsContainer;
