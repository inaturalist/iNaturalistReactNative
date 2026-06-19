import type { ErrorWithResponse, INatApiError } from "api/error";
import handleError from "api/error";
import type { ApiOpts } from "api/types";
import inatjs from "inaturalistjs";

const PARAMS = {
  fields: "all",
};

export interface ObservationFieldValueAttributes {
  observation_field_value: {
    observation_field_id: number;
    observation_id: number;
    value: string;
  };
}

const createObservationFieldValue = async (
  params: ObservationFieldValueAttributes,
  opts: ApiOpts = {},
): Promise<Record<string, unknown> | null | ErrorWithResponse | INatApiError> => {
  try {
    const { results } = await inatjs.observation_field_values.create(
      { ...PARAMS, ...params },
      opts,
    );
    return results;
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "createObservationFieldValue", opts } },
    );
  }
};

const deleteObservationFieldValue = async (
  id: number,
  opts: ApiOpts = {},
): Promise<Record<string, unknown> | null | ErrorWithResponse | INatApiError> => {
  try {
    const { results } = await inatjs.observation_field_values.delete( { id }, opts );
    return results;
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "deleteObservationFieldValue", id, opts } },
    );
  }
};

export {
  createObservationFieldValue,
  deleteObservationFieldValue,
};
