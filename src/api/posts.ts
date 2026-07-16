import type { ErrorWithResponse, INatApiError } from "api/error";
import handleError from "api/error";
import type { ApiOpts, ApiParams } from "api/types";
import inatjs from "inaturalistjs";

const fetchBlogPosts = async (
  params: Record<string, unknown> = {},
  opts: ApiOpts = {},
): Promise<Record<string, unknown> | null | ErrorWithResponse | INatApiError> => {
  try {
    return await inatjs.posts.for_user( params, opts );
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "fetchBlogPosts", opts } },
    );
  }
};

interface ProjectPostsParams extends ApiParams {
  id: number;
}

const fetchProjectPosts = async (
  params: ProjectPostsParams,
  opts: ApiOpts = {},
): Promise<Record<string, unknown> | null | ErrorWithResponse | INatApiError> => {
  try {
    return await inatjs.projects.posts( params, opts );
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "fetchProjectPosts", opts } },
    );
  }
};

interface UserPostsParams extends ApiParams {
  id: number;
}

const fetchUserPosts = async (
  params: UserPostsParams,
  opts: ApiOpts = {},
): Promise<Record<string, unknown> | null | ErrorWithResponse | INatApiError> => {
  try {
    return await inatjs.users.posts( params, opts );
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
