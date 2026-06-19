import type { ErrorWithResponse, INatApiError } from "api/error";
import handleError from "api/error";
import type { ApiOpts } from "api/types";
import inatjs from "inaturalistjs";

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
  deleteProjectObservation,
};
