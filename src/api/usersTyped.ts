import type { ErrorWithResponse, INatApiError } from "api/error";
import handleError from "api/error";
import type {
  ApiDefaultResult, ApiOpts, ApiParams, ApiResponse,
} from "api/types";
import inatjs from "inaturalistjs";

interface UsersProjectsParams extends ApiParams {
  id: number;
}

const fetchUserProjects = async <T = ApiDefaultResult>(
  params: UsersProjectsParams,
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
