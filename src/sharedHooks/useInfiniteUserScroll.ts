import { flatten } from "lodash";
import { useAuthenticatedInfiniteQuery } from "sharedHooks";

const useInfiniteUserScroll = (
  queryKey: string,
  apiCall: Function,
  ids: Array<object>,
  newInputParams: object,
  options: {
    enabled: boolean
  }
): object => {
  const baseParams = {
    ...newInputParams,
    // TODO: can change this once API pagination is working
    per_page: 200
  };

  const {
    data,
    fetchNextPage,
    status
  } = useAuthenticatedInfiniteQuery(
    [queryKey, baseParams],
    async ( { pageParam }, optsWithAuth ) => {
      const params = {
        ...baseParams
      };

      if ( pageParam ) {
        params.page = pageParam;
      } else {
        params.page = 1;
      }

      return apiCall( ids, params, optsWithAuth );
    },
    {
      getNextPageParam: lastPage => lastPage.page + 1,
      enabled: options.enabled
    }
  );

  const pages = data?.pages;
  const allResults = pages?.map( page => page?.results );

  const flattenedData = flatten( allResults );

  return {
    data: flattenedData,
    fetchNextPage,
    status,
    totalResults: pages?.[0]
      ? pages?.[0].total_results
      : null
  };
};

export default useInfiniteUserScroll;
