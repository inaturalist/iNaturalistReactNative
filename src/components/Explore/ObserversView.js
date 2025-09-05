// @flow
import { fetchObservers } from "api/observations";
import type { Node } from "react";
import React, { useEffect } from "react";
import User from "realmModels/User";
import { useInfiniteScroll } from "sharedHooks";

import ExploreFlashList from "./ExploreFlashList";

type Props = {
  canFetch?: boolean,
  isConnected: boolean,
  queryParams: Object,
  handleUpdateCount: Function
};

const LIST_STYLE = { paddingTop: 44 };

const ObserversView = ( {
  canFetch,
  isConnected,
  queryParams,
  handleUpdateCount
}: Props ): Node => {
  const {
    data,
    isFetchingNextPage,
    fetchNextPage,
    totalResults
  } = useInfiniteScroll(
    "fetchObservers",
    fetchObservers,
    {
      ...queryParams,
      order_by: "observation_count",
      fields: {
        user: User.LIMITED_FIELDS
      }
    },
    {
      enabled: canFetch
    }
  );

  useEffect( ( ) => {
    handleUpdateCount( "observers", totalResults );
  }, [totalResults, handleUpdateCount] );

  return (
    <ExploreFlashList
      canFetch={canFetch}
      contentContainerStyle={LIST_STYLE}
      data={data}
      fetchNextPage={fetchNextPage}
      hideLoadingWheel={!isFetchingNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isConnected={isConnected}
      layout="user"
      totalResults={totalResults}
    />
  );
};

export default ObserversView;
