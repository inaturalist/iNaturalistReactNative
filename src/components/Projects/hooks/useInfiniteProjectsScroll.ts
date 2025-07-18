import { searchProjects } from "api/projects";
import _, { flatten } from "lodash";
import {
  useAuthenticatedInfiniteQuery
} from "sharedHooks";

const useInfiniteProjectsScroll = ( { params: newInputParams, enabled }: object ): object => {
  const baseParams = {
    ...newInputParams,
    per_page: 20,
    ttl: -1,
    rule_details: true,
    fields: {
      id: true,
      project_type: true,
      title: true,
      icon: true,
      rule_preferences: {
        field: true,
        value: true
      }
    }
  };

  const { ...queryKeyParams } = baseParams;

  const queryKey = ["useInfiniteProjectsScroll", "searchProjects", queryKeyParams];

  const {
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage
  } = useAuthenticatedInfiniteQuery(
    queryKey,
    async ( { pageParam }, optsWithAuth ) => {
      const params = {
        ...baseParams
      };

      if ( pageParam ) {
        params.page = pageParam;
      } else {
        params.page = 1;
      }
      return searchProjects( params, optsWithAuth );
    },
    {
      getNextPageParam: lastPage => ( lastPage
        ? lastPage.page + 1
        : 1 ),
      enabled
    }
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
    projects
  };
};

export default useInfiniteProjectsScroll;
