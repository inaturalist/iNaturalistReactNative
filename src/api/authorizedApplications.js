// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

const PARAMS = {
  fields: "application.official,application.name,created_at"
};

const fetchAuthorizedApplications = async (
  params: object = {},
  opts: object = {}
): Promise<any> => {
  try {
    const { results } = await inatjs.authorized_applications.search(
      { ...PARAMS, ...params },
      opts
    );
    return results;
  } catch ( e ) {
    return handleError( e );
  }
};

const revokeAuthorizedApplications = async (
  params: object = {},
  opts: object = {}
): Promise<any> => {
  try {
    return await inatjs.authorized_applications.delete(
      params,
      opts
    );
  } catch ( e ) {
    return handleError( e );
  }
};

export {
  fetchAuthorizedApplications,
  revokeAuthorizedApplications
};
