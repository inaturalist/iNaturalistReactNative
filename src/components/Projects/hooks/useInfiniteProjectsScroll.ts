import { searchProjects } from "api/projects";
import _, { flatten } from "lodash";
import {
  useAuthenticatedInfiniteQuery,
} from "sharedHooks";

const ITEMS_PER_PAGE = 20;

const useInfiniteProjectsScroll = ( { params: newInputParams, enabled }: object ): object => {
  const baseParams = {
    ...newInputParams,
    per_page: ITEMS_PER_PAGE,
    ttl: -1,
    rule_details: true,
    fields: {
      id: true,
      project_type: true,
      title: true,
      icon: true,
      rule_preferences: {
        field: true,
        value: true,
      },
    },
  };

  const { ...queryKeyParams } = baseParams;

  const queryKey = ["useInfiniteProjectsScroll", "searchProjects", queryKeyParams];

  const {
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
  } = useAuthenticatedInfiniteQuery(
    queryKey,
    async ( { pageParam }, optsWithAuth ) => {
      const params = {
        ...baseParams,
      };

      if ( pageParam ) {
        params.page = pageParam;
      } else {
        params.page = 1;
      }
      return searchProjects( params, optsWithAuth );
    },
    // TO DO: we need to properly type queryOptions in useAuthenticatedInfiniteQuery
    /* eslint-disable consistent-return */
    {
      getNextPageParam: lastPage => {
        if ( !lastPage ) return undefined;
        const totalProjectCount = lastPage.total_results;
        const totalFetchedCount = lastPage.page * ITEMS_PER_PAGE;
        return totalFetchedCount < totalProjectCount
          ? lastPage.page + 1
          : undefined;
      },
      enabled,
    },
    /* eslint-enable consistent-return */
  );

  const pages = data?.pages;
  const allResults = pages?.map( page => page?.results );
  const projects = flatten( allResults ).sort( ( a, b ) => {
    if ( a.title < b.title ) {
      return -1;
    }
    if ( a.title > b.title ) {
      return 1;
    }
    return 0;
  } );

  return {
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    projects,
  };
};

export default useInfiniteProjectsScroll;
