// @flow

import { useAuthenticatedInfiniteQuery } from "sharedHooks";

const useInfiniteScroll = (
  queryKey: string,
  apiCall: Function,
  newInputParams: Object,
  options?: {
    enabled: boolean
  },
): Object => {
  const baseParams = {
    ...newInputParams,
    per_page: 10,
    ttl: -1,
  };

  const {
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    status,
  } = useAuthenticatedInfiniteQuery(
    [queryKey, baseParams],
    async ( { pageParam = 1 }, optsWithAuth ) => {
      const params = {
        ...baseParams,
      };

      params.page = pageParam;

      return apiCall( params, optsWithAuth );
    },
    // TO DO: we need to properly type queryOptions in useAuthenticatedInfiniteQuery
    /* eslint-disable consistent-return */
    {
      getNextPageParam: lastPage => {
        if ( !lastPage ) return undefined;

        const totalResultsCount = lastPage.total_results;
        const totalFetchedCount = lastPage.page * baseParams.per_page;

        return totalFetchedCount < totalResultsCount
          ? lastPage.page + 1
          : undefined;
      },

      enabled: options?.enabled,
    },
    /* eslint-enable consistent-return */
  );

  const pages = data?.pages || [];
  const allResults = pages?.map( page => page?.results ).flat( Infinity ).filter( Boolean );

  return {
    data: allResults,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    status,
    totalResults: pages?.[0]
      ? pages?.[0].total_results
      : null,
  };
};

export default useInfiniteScroll;
