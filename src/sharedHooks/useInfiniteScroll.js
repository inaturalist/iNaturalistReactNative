// @flow

import { flatten } from "lodash";
import { useAuthenticatedInfiniteQuery } from "sharedHooks";

const useInfiniteScroll = (
  queryKey: string,
  apiCall: Function,
  newInputParams: Object,
  options: {
    enabled: boolean
  }
): Object => {
  const baseParams = {
    per_page: 10,
    ttl: -1,
    ...newInputParams
  };

  const {
    data,
    isFetchingNextPage,
    fetchNextPage,
    status
  } = useAuthenticatedInfiniteQuery(
    [queryKey, baseParams],
    async ( { pageParam = 0 }, optsWithAuth ) => {
      const params = {
        ...baseParams
      };

      params.page = pageParam;

      return apiCall( params, optsWithAuth );
    },
    {
      getNextPageParam: lastPage => ( lastPage
        ? lastPage.page + 1
        : 1 ),
      enabled: options.enabled
    }
  );

  const pages = data?.pages;
  const allResults = pages?.map( page => page?.results );

  return {
    isFetchingNextPage,
    fetchNextPage,
    data: flatten( allResults ),
    totalResults: pages?.[0]
      ? pages?.[0].total_results
      : null,
    status
  };
};

export default useInfiniteScroll;
