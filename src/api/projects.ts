import type { ErrorWithResponse, INatApiError } from "api/error";
import handleError from "api/error";
import type {
  ApiDefaultResult,
  ApiGetByIdParams,
  ApiOpts,
  ApiResponse,
  ApiUntypedParams,
} from "api/types";
import inatjs from "inaturalistjs";

const FIELDS = {
  title: true,
  icon: true,
  project_type: true,
};

const PARAMS = {
  fields: FIELDS,
};

const fetchProjects = async (
  id: number,
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
  try {
    const { results } = await inatjs.projects.fetch( id, params, opts );
    return results[0];
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "fetchProjects", id, opts } },
    );
  }
};

const fetchProjectMembers = async (
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
  try {
    return await inatjs.projects.members( params, opts );
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "fetchProjectMembers", opts } },
    );
  }
};

const fetchProjectPostsCount = async (
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
  try {
    const response = await inatjs.projects.posts( params, opts );
    return response.total_results;
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "fetchProjectPostsCount", opts } },
    );
  }
};

const searchProjects = async ( params: ApiUntypedParams = {}, opts: ApiOpts = {} ) => {
  try {
    return await inatjs.projects.search( { ...PARAMS, ...params }, opts );
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "searchProjects", opts } },
    );
  }
};

const joinProject = async ( params: ApiUntypedParams = {}, opts: ApiOpts = {} ) => {
  try {
    return await inatjs.projects.join( { ...PARAMS, ...params }, opts );
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "joinProject", opts } },
    );
  }
};

const leaveProject = async ( params: ApiUntypedParams = {}, opts: ApiOpts = {} ) => {
  try {
    return await inatjs.projects.leave( { ...PARAMS, ...params }, opts );
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "leaveProject", opts } },
    );
  }
};

const fetchProjectMembership = async <T = ApiDefaultResult>(
  params: ApiGetByIdParams,
  opts: ApiOpts = {},
): Promise<ApiResponse<T> | null | ErrorWithResponse | INatApiError> => {
  try {
    const response = await inatjs.projects.membership( params, opts );
    if ( !response ) { return null; }
    return response;
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "fetchProjectMembership", opts } },
    );
  }
};

export default searchProjects;

export {
  fetchProjectMembers,
  fetchProjectMembership,
  fetchProjectPostsCount,
  fetchProjects,
  joinProject,
  leaveProject,
  searchProjects,
};
