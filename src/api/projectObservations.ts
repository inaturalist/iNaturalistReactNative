import type { ErrorWithResponse, INatApiError } from "api/error";
import handleError from "api/error";
import { PROJECT_OBSERVATION_FIELDS } from "api/fields";
import type { ApiOpts } from "api/types";
import inatjs from "inaturalistjs";

const PARAMS = {
  fields: PROJECT_OBSERVATION_FIELDS,
};

export interface ProjectObservationWriteParams {
  project_observation: {
    observation_id: string;
    project_id: number;
  };
}

export interface ProjectObservationUpdateParams extends ProjectObservationWriteParams {
  id: string; // uuid
}

const createProjectObservation = async (
  params: ProjectObservationWriteParams,
  opts: ApiOpts = {},
): Promise<Record<string, unknown> | null | ErrorWithResponse | INatApiError> => {
  try {
    const { results } = await inatjs.project_observations.create( { ...PARAMS, ...params }, opts );
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
    const { results } = await inatjs.project_observations.update( { ...PARAMS, ...params }, opts );
    return results;
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "updateProjectObservation", opts } },
    );
  }
};

const deleteProjectObservation = async (
  id: string, // uuid
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
