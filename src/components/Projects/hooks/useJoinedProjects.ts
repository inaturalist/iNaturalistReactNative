import { PROJECT_SUMMARY_FIELDS } from "api/fields";
import type { ApiOpts, ApiProjectSummary, ApiResponse } from "api/types";
import { fetchUserProjects } from "api/users";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import sortByTitle from "sharedHelpers/sortByTitle";
import { useAuthenticatedQuery } from "sharedHooks";

export const JOINED_PROJECTS_QUERY_KEY = "useJoinedProjects";

const PER_PAGE = 100;
// Runaway guard, ideally above any realistic number of joined projects
const MAX_PAGES = 100;

const isProjectsResponse = (
  response: unknown,
): response is ApiResponse<ApiProjectSummary> => !!response
  && Array.isArray( ( response as ApiResponse<ApiProjectSummary> ).results );

// Loads every joined project before anything is shown, because sorting in
// the app one page at a time would move rows that are already on screen
const fetchJoinedProjectsPage = (
  memberId: number,
  page: number,
  optsWithAuth: ApiOpts,
) => fetchUserProjects<ApiProjectSummary>( {
  id: memberId,
  fields: PROJECT_SUMMARY_FIELDS,
  per_page: PER_PAGE,
  page,
  ttl: -1,
}, optsWithAuth );

const fetchAllJoinedProjects = async (
  memberId: number,
  optsWithAuth: ApiOpts,
): Promise<ApiProjectSummary[]> => {
  // The first page tells us how many pages there are; and the rest load in parallel
  const firstPage = await fetchJoinedProjectsPage( memberId, 1, optsWithAuth );
  if ( !isProjectsResponse( firstPage ) ) {
    return [];
  }
  const totalPages = Math.min(
    Math.ceil( firstPage.total_results / PER_PAGE ),
    MAX_PAGES,
  );
  const remainingPages = await Promise.all(
    Array.from(
      { length: Math.max( totalPages - 1, 0 ) },
      ( _, index ) => fetchJoinedProjectsPage( memberId, index + 2, optsWithAuth ),
    ),
  );
  return [firstPage, ...remainingPages]
    .flatMap( response => ( isProjectsResponse( response )
      ? response.results
      : [] ) );
};

const useJoinedProjects = ( memberId: number | undefined, enabled: boolean ) => {
  const { i18n } = useTranslation( );

  const { data, isFetching } = useAuthenticatedQuery(
    [JOINED_PROJECTS_QUERY_KEY, memberId],
    optsWithAuth => ( memberId
      ? fetchAllJoinedProjects( memberId, optsWithAuth )
      : Promise.resolve( [] ) ),
    { enabled: enabled && !!memberId },
  );

  // Same order as the joined Traditional Projects in Add to Projects
  const projects = useMemo(
    ( ) => sortByTitle( data ?? [], i18n.language ),
    [data, i18n.language],
  );

  return { isFetching, projects };
};

export default useJoinedProjects;
