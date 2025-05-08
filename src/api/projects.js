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

const fetchProjects = async (
  id: number,
  params: Object = {},
  opts: Object = {}
): Promise<?Object> => {
  try {
    const { results } = await inatjs.projects.fetch( id, params, opts );
    return results[0];
  } catch ( e ) {
    return handleError( e, { context: { functionName: "fetchProjects", id, opts } } );
  }
};

const fetchProjectMembers = async (
  params: Object = {},
  opts: Object = {}
): Promise<?Object> => {
  try {
    return await inatjs.projects.members( params, opts );
  } catch ( e ) {
    return handleError( e, { context: { functionName: "fetchProjectMembers", opts } } );
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
    return handleError( e, { context: { functionName: "fetchProjectPosts", opts } } );
  }
};

const searchProjects = async ( params: Object = {}, opts: Object = {} ): Promise<?Object> => {
  try {
    return await inatjs.projects.search( { ...PARAMS, ...params }, opts );
  } catch ( e ) {
    return handleError( e, { context: { functionName: "searchProjects", opts } } );
  }
};

const joinProject = async ( params: Object = {}, opts: Object = {} ): Promise<?Object> => {
  try {
    return await inatjs.projects.join( { ...PARAMS, ...params }, opts );
  } catch ( e ) {
    return handleError( e, { context: { functionName: "joinProject", opts } } );
  }
};

const leaveProject = async ( params: Object = {}, opts: Object = {} ): Promise<?Object> => {
  try {
    return await inatjs.projects.leave( { ...PARAMS, ...params }, opts );
  } catch ( e ) {
    return handleError( e, { context: { functionName: "leaveProject", opts } } );
  }
};

const fetchMembership = async ( params: Object = {}, opts: Object = {} ): Promise<?Object> => {
  try {
    const response = await inatjs.projects.membership( { ...PARAMS, ...params }, opts );
    return response.total_results;
  } catch ( e ) {
    return handleError( e, { context: { functionName: "fetchMembership", opts } } );
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
