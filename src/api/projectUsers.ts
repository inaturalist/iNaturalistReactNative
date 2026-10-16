import type { ErrorWithResponse, INatApiError } from "api/error";
import handleError from "api/error";
import type { ApiDefaultResult, ApiOpts, ApiResponse } from "api/types";
import type { COORDINATE_ACCESS } from "components/ProjectDetails/Sheets/CoordinateAccessSheet";
import inatjs from "inaturalistjs";
import { EnvConfig } from "sharedHelpers/envConfig";

// The v2 request schema for PUT /project_users/:id only allows the
// collection-project keys, so preferred_curator_coordinate_access has to go
// through v1. inatjs honors a per-call apiURL override, so derive the v1 base
// from the configured v2 URL instead of changing the global config.
const V1_API_URL = ( EnvConfig.API_URL || "" ).replace( /\/v2\/?$/, "/v1" );

export interface ProjectUserUpdateParams {
  id: number; // int ID
  project_user: {
    // TODO: this param is not working with API v2 but is working with v1
    preferred_curator_coordinate_access: COORDINATE_ACCESS;
  };
}

const updateProjectUser = async <T = ApiDefaultResult>(
  params: ProjectUserUpdateParams,
  opts: ApiOpts = {},
): Promise<ApiResponse<T> | null | ErrorWithResponse | INatApiError> => {
  try {
    const response = await inatjs.project_users.update(
      params,
      { ...opts, apiURL: V1_API_URL },
    );
    return response;
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "updateProjectUser", opts } },
    );
  }
};

export {
  updateProjectUser,
};
