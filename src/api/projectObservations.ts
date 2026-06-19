import type { ErrorWithResponse, INatApiError } from "api/error";
import handleError from "api/error";
import type { ApiOpts } from "api/types";
import inatjs from "inaturalistjs";

export interface ProjectObservationWriteParams {
  project_observation: {
    observation_id: number;
    project_id: number;
  };
}

export interface ProjectObservationUpdateParams extends ProjectObservationWriteParams {
  id: number;
}

const createProjectObservation = async (
  params: ProjectObservationWriteParams,
  opts: ApiOpts = {},
): Promise<Record<string, unknown> | null | ErrorWithResponse | INatApiError> => {
  try {
    const { results } = await inatjs.project_observations.create( params, opts );
    return results;
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "createProjectObservation", opts } },
    );
  }
};

const updateProjectObservation = async (
  params: ProjectObservationUpdateParams,
  opts: ApiOpts = {},
): Promise<Record<string, unknown> | null | ErrorWithResponse | INatApiError> => {
  try {
    const { results } = await inatjs.project_observations.update( params, opts );
    return results;
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "updateProjectObservation", opts } },
    );
  }
};

const deleteProjectObservation = async (
  id: number,
  opts: ApiOpts = {},
): Promise<Record<string, unknown> | null | ErrorWithResponse | INatApiError> => {
  try {
    const { results } = await inatjs.project_observations.delete( { id }, opts );
    return results;
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "deleteProjectObservation", id, opts } },
    );
  }
};

export {
  createProjectObservation,
  deleteProjectObservation,
  updateProjectObservation,
};
