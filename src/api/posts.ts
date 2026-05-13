import type { ErrorWithResponse, INatApiError } from "api/error";
import handleError from "api/error";
import inatjs from "inaturalistjs";

const fetchUserPosts = async (
  params: Record<string, unknown> = {},
  opts: Record<string, unknown> = {},
): Promise<Record<string, unknown> | null | ErrorWithResponse | INatApiError> => {
  try {
    const response = await inatjs.posts.for_user( params, opts );
    if ( !response ) { return null; }
    return response?.results;
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "fetchUserPosts", opts } },
    );
  }
};

export default fetchUserPosts;
