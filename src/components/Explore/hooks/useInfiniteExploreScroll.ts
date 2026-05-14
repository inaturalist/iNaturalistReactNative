import { useQueryClient } from "@tanstack/react-query";
import { searchObservations } from "api/observations";
import type {
  ApiObservation,
  ApiObservationsSearchParams,
  ApiObservationsSearchResponse,
} from "api/types";
import flatten from "lodash/flatten";
import { useCallback, useMemo } from "react";
import Observation from "realmModels/Observation";
import { useAuthenticatedInfiniteQuery } from "sharedHooks";

import {
  addPageParamsForExplore,
  getNextPageParamForExplore,
} from "../helpers/exploreParams";

interface ExcludeUser {
  id: number;
}

interface UseInfiniteExploreScrollParams {
  params: ApiObservationsSearchParams & { excludeUser?: ExcludeUser };
  enabled: boolean;
}

interface UseInfiniteExploreScrollReturn {
  fetchNextPage: ( ) => void;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  handlePullToRefresh: ( ) => Promise<void>;
  observations: ApiObservation[];
  status: string;
  totalBounds: object | undefined;
  totalResults: number | null | undefined;
}

const useInfiniteExploreScroll = (
  { params: newInputParams, enabled }: UseInfiniteExploreScrollParams,
): UseInfiniteExploreScrollReturn => {
  const queryClient = useQueryClient( );

  const baseParams = useMemo( () => ( {
    ...newInputParams,
    fields: {
      ...Observation.ADVANCED_MODE_LIST_FIELDS,
      user: {
        id: true,
        uuid: true,
        login: true,
      },
    },
    ttl: -1,
  } ), [newInputParams] );

  const excludedUser: ExcludeUser | undefined = newInputParams.excludeUser;

  const queryKey = ["useInfiniteExploreScroll", newInputParams];

  const getNextPageParam = useCallback(
    ( lastPage: ApiObservationsSearchResponse ) => getNextPageParamForExplore(
      lastPage,
      baseParams,
    ),
    [baseParams],
  );

  const {
    data,
    isFetchingNextPage,
    isLoading,
    fetchNextPage,
    refetch,
    isRefetching,
    status,
  } = useAuthenticatedInfiniteQuery(
    queryKey,
    async ( params, optsWithAuth ) => searchObservations(
      addPageParamsForExplore( { ...baseParams, ...params } ),
      optsWithAuth,
    ),
    {
      getNextPageParam,
      enabled,
    },
  );

  const handlePullToRefresh = async ( ) => {
    queryClient.removeQueries( { queryKey } );
    await refetch( );
  };

  const pages = data?.pages as ApiObservationsSearchResponse[] | undefined;

  let observations: ApiObservation[] = flatten( pages?.map( r => r.results ) ) || [];
  let totalResults: number | null | undefined = pages?.[0]?.total_results;

  if ( excludedUser && observations ) {
    observations = observations.filter(
      observation => observation?.user?.id !== excludedUser.id,
    );
  }

  if ( totalResults !== 0 && !totalResults ) {
    totalResults = null;
  }

  return {
    fetchNextPage,
    isLoading,
    isFetchingNextPage: isFetchingNextPage || isRefetching,
    handlePullToRefresh,
    observations,
    status,
    totalBounds: pages?.[0]?.total_bounds,
    totalResults,
  };
};

export default useInfiniteExploreScroll;
