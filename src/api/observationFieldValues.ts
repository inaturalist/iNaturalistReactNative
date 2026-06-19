import type { ErrorWithResponse, INatApiError } from "api/error";
import handleError from "api/error";
import { OBSERVATION_FIELD_VALUE_FIELDS } from "api/fields";
import type { ApiOpts } from "api/types";
import inatjs from "inaturalistjs";

const PARAMS = {
  fields: OBSERVATION_FIELD_VALUE_FIELDS,
};

export interface ObservationFieldValueAttributes {
  observation_field_value: {
    observation_field_id: number;
    observation_id: number;
    value: string | number;
  };
}

export interface ObservationFieldValueUpdateParams extends ObservationFieldValueAttributes {
  id: number;
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

const updateObservationFieldValue = async (
  params: ObservationFieldValueUpdateParams,
  opts: ApiOpts = {},
): Promise<Record<string, unknown> | null | ErrorWithResponse | INatApiError> => {
  try {
    const { results } = await inatjs.observation_field_values.update(
      { ...PARAMS, ...params },
      opts,
    );
    return results;
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "updateObservationFieldValue", opts } },
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
  updateObservationFieldValue,
};
