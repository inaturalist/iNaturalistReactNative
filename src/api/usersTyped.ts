import handleError from "api/error";
import type {
  ApiDefaultResult, ApiGetByIdParams, ApiOpts, ApiResponse,
} from "api/types";
import inatjs from "inaturalistjs";

const fetchUserProjects = async <T = ApiDefaultResult>(
  params: ApiGetByIdParams,
  opts: ApiOpts = {},
): Promise<ApiResponse<T> | null> => {
  try {
    const response = await inatjs.users.projects( params, opts );
    if ( !response ) { return null; }
    return response;
  } catch ( e ) {
    return handleError(
      e,
      { context: { functionName: "fetchUserProjects", opts } },
    );
  }
};

export default fetchUserProjects;
