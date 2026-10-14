import inatjs from "inaturalistjs";

import type { ErrorWithResponse } from "./error";
import handleError from "./error";
import type { ApiOpts, ApiUntypedParams } from "./types";

const REMOTE_USER_FIELDS = {
  created_at: true,
  description: true,
  icon_url: true,
  id: true,
  identifications_count: true,
  journal_posts_count: true,
  locale: true,
  login: true,
  monthly_supporter: true,
  name: true,
  observations_count: true,
  place_id: true,
  roles: true,
  site: {
    name: true,
  },
  species_count: true,
  updated_at: true,
  prefers_common_names: true,
  prefers_no_tracking: true,
  prefers_scientific_name_first: true,
};

const REMOTE_USER_PARAMS = {
  fields: REMOTE_USER_FIELDS,
};

const fetchUserMe = async ( params: ApiUntypedParams = {}, opts: ApiOpts = {} ) => {
  try {
    const response = await inatjs.users.me( { ...REMOTE_USER_PARAMS, ...params, ...opts } );
    return response?.results[0];
  } catch ( e ) {
    return handleError( e as ErrorWithResponse, { throw: true } );
  }
};

const fetchRemoteUser = async (
  id: number | string | null | undefined,
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
  if ( !id ) return null;
  try {
    const { results } = await inatjs.users.fetch( id, {
      ...REMOTE_USER_PARAMS,
      ...params,
      ...opts,
    } );
    return results[0];
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "fetchRemoteUser", id, opts } },
    );
  }
};

const fetchUsers = async (
  ids: number[],
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
  try {
    return await inatjs.users.fetch( ids, params, opts );
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "fetchUsers", ids, opts } },
    );
  }
};

const blockUser = async (
  id: number,
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
  try {
    const response = await inatjs.users.block( { id }, {
      ...params,
      ...opts,
    } );
    return response;
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "blockUser", id, opts } },
    );
  }
};

const muteUser = async (
  id: number,
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
  try {
    const response = await inatjs.users.mute( { id }, {
      ...params,
      ...opts,
    } );
    return response;
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "muteUser", id, opts } },
    );
  }
};

const unblockUser = async (
  id: number,
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
  try {
    const response = await inatjs.users.unblock( { id }, {
      ...params,
      ...opts,
    } );
    return response;
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "unblockUser", id, opts } },
    );
  }
};

const unmuteUser = async (
  id: number,
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
  try {
    const response = await inatjs.users.unmute( { id }, {
      ...params,
      ...opts,
    } );
    return response;
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "unmuteUser", id, opts } },
    );
  }
};

const updateUsers = async ( params: ApiUntypedParams = {}, opts: ApiOpts = {} ) => {
  try {
    return await inatjs.users.update( params, opts );
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "updateUsers", opts } },
    );
  }
};

const fetchUserEmailAvailable = async (
  email: string,
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
  try {
    return await inatjs.users.emailAvailable( { email }, { ...params, ...opts } );
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "fetchUserEmailAvailable", email, opts } },
    );
  }
};

export {
  blockUser,
  fetchRemoteUser,
  fetchUserEmailAvailable,
  fetchUserMe,
  fetchUsers,
  muteUser,
  unblockUser,
  unmuteUser,
  updateUsers,
};
