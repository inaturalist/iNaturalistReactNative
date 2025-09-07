// @flow
import { fetchIdentifiers } from "api/observations";
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

const IdentifiersView = ( {
  canFetch,
  isConnected,
  queryParams,
  handleUpdateCount
}: Props ): Node => {
  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    totalResults
  } = useInfiniteScroll(
    "fetchIdentifiers",
    fetchIdentifiers,
    {
      ...queryParams,
      fields: {
        identifications_count: true,
        user: User.LIMITED_FIELDS
      }
    },
    {
      enabled: canFetch
    }
  );

  useEffect( ( ) => {
    handleUpdateCount( "identifiers", totalResults );
  }, [totalResults, handleUpdateCount] );

  return (
    <ExploreFlashList
      canFetch={canFetch}
      contentContainerStyle={LIST_STYLE}
      data={data}
      fetchNextPage={fetchNextPage}
      hideLoadingWheel={!isFetchingNextPage}
      isConnected={isConnected}
      isFetchingNextPage={isFetchingNextPage}
      layout="user"
      totalResults={totalResults}
    />
  );
};

export default IdentifiersView;
