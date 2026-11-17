import type { PROJECT_SUMMARY_FIELDS } from "api/fields";
import { searchProjects } from "api/projects";
import type { ApiProjectSummary, ApiResponse } from "api/types";
import flatten from "lodash/flatten";
import { useTranslation } from "react-i18next";
import sortByTitle from "sharedHelpers/sortByTitle";
import {
  useAuthenticatedInfiniteQuery,
} from "sharedHooks";

const ITEMS_PER_PAGE = 20;

export interface UseInfiniteProjectsScrollOptions {
  params: {
    fields: typeof PROJECT_SUMMARY_FIELDS;
    q: string;
    lat?: number;
    lng?: number;
    featured?: boolean;
    order_by?: "distance";
    spam?: boolean;
  };
  enabled: boolean;
}

const useInfiniteProjectsScroll = (
  { params: newInputParams, enabled }: UseInfiniteProjectsScrollOptions,
) => {
  const { i18n } = useTranslation( );
  const baseParams = {
    ...newInputParams,
    per_page: ITEMS_PER_PAGE,
    ttl: -1,
    rule_details: true,
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
      const params = { ...baseParams, page: pageParam || 1 };
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

  const pages: ApiResponse<ApiProjectSummary>[] | undefined = data?.pages;
  const allResults = pages?.map( page => page?.results );
  const flattenedProjects = flatten( allResults );
  // If the server has a requested order, keep it (e.g. Nearby tab's order_by=distance);
  // otherwise, alphabetize
  const projects = baseParams.order_by
    ? flattenedProjects
    : sortByTitle( flattenedProjects, i18n.language );

  return {
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    projects,
  };
};

export default useInfiniteProjectsScroll;
