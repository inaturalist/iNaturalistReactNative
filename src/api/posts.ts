import type { ErrorWithResponse, INatApiError } from "api/error";
import handleError from "api/error";
import type {
  ApiDefaultResult, ApiGetByIdParams, ApiOpts, ApiParams, ApiResponse,
} from "api/types";
import inatjs from "inaturalistjs";

const fetchBlogPosts = async <T = ApiDefaultResult>(
  params: ApiParams = {},
  opts: ApiOpts = {},
): Promise<ApiResponse<T> | null | ErrorWithResponse | INatApiError> => {
  // A user JWT makes Rails use that account's network site and include project
  // journal posts. Omitting it keeps this feed on the API host site, iNaturalist.org.
  const { api_token: _apiToken, ...publicOpts } = opts;
  try {
    const response = await inatjs.posts.for_user( params, publicOpts );
    if ( !response ) { return null; }
    return response;
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "fetchBlogPosts", opts: publicOpts } },
    );
  }
};

const fetchProjectPosts = async <T = ApiDefaultResult>(
  params: ApiGetByIdParams,
  opts: ApiOpts = {},
): Promise<ApiResponse<T> | null | ErrorWithResponse | INatApiError> => {
  try {
    const response = await inatjs.projects.posts( params, opts );
    if ( !response ) { return null; }
    return response;
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "fetchProjectPosts", opts } },
    );
  }
};

const fetchUserPosts = async <T = ApiDefaultResult>(
  params: ApiGetByIdParams,
  opts: ApiOpts = {},
): Promise<ApiResponse<T> | null | ErrorWithResponse | INatApiError> => {
  try {
    const response = await inatjs.users.posts( params, opts );
    if ( !response ) { return null; }
    return response;
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "fetchUserPosts", opts } },
    );
  }
};

export {
  fetchBlogPosts,
  fetchProjectPosts,
  fetchUserPosts,
};
