import inatjs from "inaturalistjs";
import Identification from "realmModels/Identification";

import handleError from "./error";
import type { ApiOpts, ApiUntypedParams } from "./types";

const PARAMS = {
  fields: Identification.ID_FIELDS,
};

const createIdentification = async (
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
  try {
    const { results } = await inatjs.identifications.create( { ...PARAMS, ...params }, opts );
    return results;
  } catch ( e ) {
    return handleError(
      e,
      { context: { functionName: "createIdentification", opts } },
    );
  }
};

const updateIdentification = async (
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
  try {
    const { results } = await inatjs.identifications.update( { ...PARAMS, ...params }, opts );
    return results;
  } catch ( e ) {
    return handleError(
      e,
      { context: { functionName: "updateIdentification", opts } },
    );
  }
};

export {
  createIdentification,
  updateIdentification,
};
