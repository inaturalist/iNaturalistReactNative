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
): Promise<?Object> => {
  try {
    const { results } = await inatjs.comments.create( { ...PARAMS, ...params }, opts );
    return results;
  } catch ( e ) {
    return handleError( e, { context: { functionName: "createComment", opts } } );
  }
};

const updateComment = async (
  params: Object = {},
  opts: Object = {}
): Promise<?Object> => {
  try {
    const { results } = await inatjs.comments.update( { ...PARAMS, ...params }, opts );
    return results;
  } catch ( e ) {
    return handleError( e, { context: { functionName: "updateComment", opts } } );
  }
};

const deleteComments = async (
  id: number,
  opts: Object = {}
): Promise<?Object> => {
  try {
    const { results } = await inatjs.comments.delete( { id }, opts );
    return results;
  } catch ( e ) {
    return handleError( e, { context: { functionName: "deleteComments", id, opts } } );
  }
};

export {
  createComment,
  deleteComments,
  updateComment
};
