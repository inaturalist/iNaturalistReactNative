// @flow

import { ActivityAnimation, ObservationsFlashList, ViewWrapper } from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import {
  useCurrentUser,
  useInfiniteObservationsScroll,
  useIsConnected
} from "sharedHooks";

const Identify = (): Node => {
  const currentUser = useCurrentUser();
  const isOnline = useIsConnected();

  const params = {
    iconic_taxa: "unknown",
    quality_grade: "needs_id",
    per_page: 50,
    viewer_id: currentUser?.id,
    reviewed: "false",
    without_taxon_id: [67333, 131236, 151817]
  };

  const {
    observations, isFetchingNextPage, fetchNextPage, status
  }
    = useInfiniteObservationsScroll( { upsert: false, params } );

  if ( !observations || !observations.length > 0 ) {
    return <ActivityAnimation />;
  }

  return (
    <ViewWrapper testID="Identify" className="flex-1">
      <ObservationsFlashList
        testID="MyObservationsAnimatedList"
        dataCanBeFetched={!!currentUser}
        data={observations}
        hideLoadingWheel={!isFetchingNextPage || !currentUser}
        isFetchingNextPage={isFetchingNextPage}
        isOnline={isOnline}
        layout="list"
        onEndReached={fetchNextPage}
        showObservationsEmptyScreen
        status={status}
      />
    </ViewWrapper>
  );
};
export default Identify;
