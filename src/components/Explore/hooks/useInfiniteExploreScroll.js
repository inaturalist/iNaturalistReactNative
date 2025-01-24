// @flow

import { useQueryClient } from "@tanstack/react-query";
import { searchObservations } from "api/observations";
import { flatten } from "lodash";
import { useCallback, useMemo } from "react";
import Observation from "realmModels/Observation";
import { useAuthenticatedInfiniteQuery } from "sharedHooks";

import {
  addPageParamsForExplore,
  getNextPageParamForExplore
} from "../helpers/exploreParams";

const useInfiniteExploreScroll = ( { params: newInputParams, enabled }: Object ): Object => {
  const queryClient = useQueryClient( );

  const baseParams = useMemo( () => ( {
    ...newInputParams,
    fields: {
      ...Observation.EXPLORE_LIST_FIELDS,
      user: { // included here for "exclude by current user" in explore filters
        id: true,
        uuid: true,
        login: true
      }
    },
    ttl: -1
  } ), [newInputParams] );

  const excludedUser = newInputParams.excludeUser;

  const queryKey = ["useInfiniteExploreScroll", newInputParams];

  const getNextPageParam = useCallback(
    lastPage => getNextPageParamForExplore( lastPage, baseParams ),
    [baseParams]
  );

  const {
    data,
    isFetchingNextPage,
    isLoading,
    fetchNextPage,
    refetch,
    isRefetching,
    status
  } = useAuthenticatedInfiniteQuery(
    queryKey,
    async ( params, optsWithAuth ) => searchObservations(
      addPageParamsForExplore( { ...baseParams, ...params } ),
      optsWithAuth
    ),
    {
      getNextPageParam,
      enabled
    }
  );

  const handlePullToRefresh = async ( ) => {
    queryClient.removeQueries( { queryKey } );
    await refetch( );
  };

  let observations = flatten( data?.pages?.map( r => r.results ) ) || [];
  let totalResults = data?.pages?.[0].total_results;
  let filtered = [];

  // filter out obs from excluded user and adjust count
  if ( excludedUser && observations ) {
    filtered = observations.filter( observation => observation?.user.id !== excludedUser.id );
    observations = filtered;
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
    totalBounds: data?.pages?.[0].total_bounds,
    totalResults
  };
};

export default useInfiniteExploreScroll;
