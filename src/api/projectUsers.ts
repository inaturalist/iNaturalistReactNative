import type { ErrorWithResponse, INatApiError } from "api/error";
import handleError from "api/error";
// import { PROJECT_OBSERVATION_FIELDS } from "api/fields";
import type { ApiDefaultResult, ApiOpts, ApiResponse } from "api/types";
import type { COORDINATE_ACCESS } from "components/ProjectDetails/Sheets/CoordinateAccessSheet";
import inatjs from "inaturalistjs";

const PARAMS = {
  fields: "all",
  // fields: PROJECT_OBSERVATION_FIELDS,
};

export interface ProjectUserUpdateParams {
  id: number;
  // id: string; // uuid
  project_user: {
    preferred_curator_coordinate_access: COORDINATE_ACCESS;
  };
}

const updateProjectUser = async <T = ApiDefaultResult>(
  params: ProjectUserUpdateParams,
  opts: ApiOpts = {},
): Promise<ApiResponse<T> | null | ErrorWithResponse | INatApiError> => {
  try {
    const response = await inatjs.project_users.update( { ...PARAMS, ...params }, opts );
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
