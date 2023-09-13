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
  place_id: true
};

const DETAIL_PARAMS = {
  fields: DETAIL_FIELDS
};

const fetchProjects = async (
  id: number,
  params: Object = {},
  opts: Object = {}
): Promise<any> => {
  try {
    const { results } = await inatjs.projects.fetch( id, { ...DETAIL_PARAMS, ...params }, opts );
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
