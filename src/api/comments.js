// @flow

import inatjs from "inaturalistjs";
import Comment from "realmModels/Comment";

import handleError from "./error";

const PARAMS = {
  fields: Comment.COMMENT_FIELDS
};

const createComment = async (
  params: Object = {},
  opts: Object = {}
): Promise<any> => {
  try {
    const { results } = await inatjs.comments.create( { ...PARAMS, ...params }, opts );
    return results;
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
