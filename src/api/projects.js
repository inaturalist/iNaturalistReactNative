// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

const FIELDS = {
  title: true,
  icon: true,
  header_image_url: true,
  description: true
};

const PARAMS = {
  fields: FIELDS
};

const fetchProjects = async (
  id: number,
  params: Object = {},
  opts: Object = {}
): Promise<any> => {
  try {
    const { results } = await inatjs.projects.fetch( id, { ...PARAMS, ...params }, opts );
    return results[0];
  } catch ( e ) {
    return handleError( e );
  }
};

const searchProjects = async ( params: Object = {}, opts: Object = {} ): Promise<any> => {
  try {
    const { results } = await inatjs.projects.search( { ...PARAMS, ...params }, opts );
    return results;
  } catch ( e ) {
    return handleError( e );
  }
};

export default searchProjects;

export {
  fetchProjects,
  searchProjects
};
