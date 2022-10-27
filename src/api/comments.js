// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

const createComment = async (
  params: Object = {},
  opts: Object = {}
): Promise<any> => {
  try {
    return await inatjs.comments.create( params, opts );
  } catch ( e ) {
    return handleError( e );
  }
};

const deleteComments = async (
  id: number,
  opts: Object = {}
): Promise<any> => {
  try {
    return await inatjs.comments.delete( { id }, opts );
  } catch ( e ) {
    return handleError( e );
  }
};

export {
  createComment,
  deleteComments
};
