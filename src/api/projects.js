// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

const FIELDS = {
  title: true,
  icon: true,
  project_type: true
};

const PARAMS = {
  fields: FIELDS
};

const DETAIL_FIELDS = {
  ...FIELDS,
  icon_file_name: true,
  header_image_url: true,
  description: true,
  place_id: true,
  observation_count: true,
  species_count: true
};

const DETAIL_PARAMS = {
  fields: DETAIL_FIELDS
};

const fetchProjects = async (
  id: number,
  params: Object = {},
  opts: Object = {}
): Promise<?Object> => {
  try {
    const { results } = await inatjs.projects.fetch( id, { ...DETAIL_PARAMS, ...params }, opts );
    return results[0];
  } catch ( e ) {
    return handleError( e );
  }
};

const fetchProjectMembers = async (
  params: Object = {},
  opts: Object = {}
): Promise<?Object> => {
  try {
    const response = await inatjs.projects.members( params, opts );
    return response.total_results;
  } catch ( e ) {
    return handleError( e );
  }
};

const fetchProjectPosts = async (
  params: Object = {},
  opts: Object = {}
): Promise<?Object> => {
  try {
    const response = await inatjs.projects.posts( params, opts );
    return response.total_results;
  } catch ( e ) {
    return handleError( e );
  }
};

const searchProjects = async ( params: Object = {}, opts: Object = {} ): Promise<?Object> => {
  try {
    return await inatjs.projects.search( { ...PARAMS, ...params }, opts );
  } catch ( e ) {
    return handleError( e );
  }
};

const joinProject = async ( params: Object = {}, opts: Object = {} ): Promise<?Object> => {
  try {
    return await inatjs.projects.join( { ...PARAMS, ...params }, opts );
  } catch ( e ) {
    return handleError( e );
  }
};

const leaveProject = async ( params: Object = {}, opts: Object = {} ): Promise<?Object> => {
  try {
    return await inatjs.projects.leave( { ...PARAMS, ...params }, opts );
  } catch ( e ) {
    return handleError( e );
  }
};

const fetchMembership = async ( params: Object = {}, opts: Object = {} ): Promise<?Object> => {
  try {
    const response = await inatjs.projects.membership( { ...PARAMS, ...params }, opts );
    return response.total_results;
  } catch ( e ) {
    return handleError( e );
  }
};

export default searchProjects;

export {
  fetchMembership,
  fetchProjectMembers,
  fetchProjectPosts,
  fetchProjects,
  joinProject,
  leaveProject,
  searchProjects
};
