import inatjs from "inaturalistjs";

import type { ErrorWithResponse } from "./error";
import handleError from "./error";

const fetchUserProjects = async ( params = {}, opts = {} ): Promise<object> => {
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
