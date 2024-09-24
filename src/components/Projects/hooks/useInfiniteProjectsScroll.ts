import { searchProjects } from "api/projects";
import _, { flatten } from "lodash";
import {
  useAuthenticatedInfiniteQuery
} from "sharedHooks";

const useInfiniteProjectsScroll = ( { params: newInputParams, enabled }: Object ): Object => {
  const baseParams = {
    ...newInputParams,
    per_page: 50,
    ttl: -1
  };

  const { fields, ...queryKeyParams } = baseParams;

  const queryKey = ["useInfiniteProjectsScroll", "searchProjects", queryKeyParams];

  const {
    data: projects,
    status,
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

  return {
    isFetchingNextPage,
    fetchNextPage,
    projects: flatten( projects?.pages ),
    status
  };
};

export default useInfiniteProjectsScroll;
