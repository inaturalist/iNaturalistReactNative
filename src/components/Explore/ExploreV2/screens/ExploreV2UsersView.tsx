import { fetchIdentifiers, fetchObservers } from "api/observations";
import { IDENTIFIERS_TAB, OBSERVERS_TAB } from "appConstants/tabs";
import ExploreFlashList from "components/Explore/ExploreFlashList";
import type {
  ExploreV2BaseQueryParams,
} from "components/Explore/ExploreV2/helpers/buildQueryParams";
import React from "react";
import User from "realmModels/User";
import useInfiniteScroll from "sharedHooks/useInfiniteScroll";

export type UsersTab = typeof OBSERVERS_TAB | typeof IDENTIFIERS_TAB;

const TAB_CONFIG = {
  [OBSERVERS_TAB]: {
    queryKey: "exploreV2Observers",
    fetchUsers: fetchObservers,
    extraParams: {
      order_by: "observation_count",
      fields: {
        user: User.LIMITED_FIELDS,
      },
    },
  },
  [IDENTIFIERS_TAB]: {
    queryKey: "exploreV2Identifiers",
    fetchUsers: fetchIdentifiers,
    extraParams: {
      fields: {
        identifications_count: true,
        user: User.LIMITED_FIELDS,
      },
    },
  },
};

interface Props {
  enabled: boolean;
  isConnected: boolean | null;
  params: ExploreV2BaseQueryParams;
  tab: UsersTab;
}

const ExploreV2UsersView = ( {
  enabled,
  isConnected,
  params,
  tab,
}: Props ) => {
  const { queryKey, fetchUsers, extraParams } = TAB_CONFIG[tab];

  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    totalResults,
  } = useInfiniteScroll(
    queryKey,
    fetchUsers,
    {
      ...params,
      ...extraParams,
    },
    { enabled },
  );

  return (
    <ExploreFlashList
      canFetch={enabled}
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

export default ExploreV2UsersView;
