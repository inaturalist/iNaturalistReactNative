import inatjs from "inaturalistjs";

import type { ErrorWithResponse } from "./error";
import handleError from "./error";
import type { ApiOpts, ApiParams } from "./types";

interface UsersProjectsParams extends ApiParams {
  id: number;
}

const fetchUserProjects = async (
  params: UsersProjectsParams = {},
  opts: ApiOpts = {},
): Promise<object> => {
  try {
    const response = await inatjs.users.projects(
      params,
      opts,
    );
    return response;
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "fetchUserProjects", opts } },
    );
  }
};

export default fetchUserProjects;
