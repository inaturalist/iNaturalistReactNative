// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

const PARAMS = {
  fields: "all"
};

const MEMBER_PROJECT_FIELDS = {
  title: true,
  icon: true
};

const MEMBER_PROJECT_PARAMS = {
  per_page: 10,
  fields: MEMBER_PROJECT_FIELDS
};

const REMOTE_USER_FIELDS = {
  name: true,
  login: true,
  icon_url: true,
  created_at: true,
  roles: true,
  site_id: true,
  description: true,
  updated_at: true,
  species_count: true,
  observations_count: true,
  identifications_count: true,
  journal_posts_count: true,
  site: true
};

const REMOTE_USER_PARAMS = {
  fields: REMOTE_USER_FIELDS
};

const fetchUserMe = async ( params: Object = {}, opts: Object = {} ): Promise<any> => {
  try {
    const { results } = await inatjs.users.me( { ...PARAMS, ...params, ...opts } );
    return results[0];
  } catch ( e ) {
    return handleError( e );
  }
};

const fetchMemberProjects = async ( params: Object = {}, opts: Object = {} ): Promise<any> => {
  try {
    const { results } = await inatjs.users.projects( {
      ...MEMBER_PROJECT_PARAMS,
      ...params,
      ...opts
    } );
    return results;
  } catch ( e ) {
    return handleError( e );
  }
};

const fetchRemoteUser = async (
  id: number,
  params: Object = {},
  opts: Object = {}
): Promise<any> => {
  try {
    const { results } = await inatjs.users.fetch( id, {
      ...REMOTE_USER_PARAMS,
      ...params,
      ...opts
    } );
    return results;
  } catch ( e ) {
    return handleError( e );
  }
};

export {
  fetchMemberProjects,
  fetchRemoteUser,
  fetchUserMe
};
