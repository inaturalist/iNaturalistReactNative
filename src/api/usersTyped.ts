import inatjs from "inaturalistjs";

import type { ErrorWithResponse, INatApiError } from "./error";
import handleError from "./error";
import type { ApiOpts, ApiParams, ApiResponse } from "./types";

interface UsersProjectsParams extends ApiParams {
  id: number;
}

const fetchUserProjects = async <T>(
  params: UsersProjectsParams = {},
  opts: ApiOpts = {},
): Promise<ApiResponse<T> | null | ErrorWithResponse | INatApiError> => {
  try {
    const response = await inatjs.users.projects( params, opts );
    if ( !response ) { return null; }
    return response;
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "fetchUserProjects", opts } },
    );
  }
};

export default fetchUserProjects;
