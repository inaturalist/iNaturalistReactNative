// @flow

import inatjs from "inaturalistjs";
import Comment from "realmModels/Comment";

import handleError from "./error";

const PARAMS = {
  fields: Comment.COMMENT_FIELDS
};

const createComment = async (
  params: any = {},
  opts: any = {}
): Promise<any> => {
  try {
    const { results } = await inatjs.comments.create( { ...PARAMS, ...params }, opts );
    return results;
  } catch ( e ) {
    return handleError( e );
  }
};

const updateComment = async (
  params: any = {},
  opts: any = {}
): Promise<any> => {
  try {
    const { results } = await inatjs.comments.update( { ...PARAMS, ...params }, opts );
    return results;
  } catch ( e ) {
    return handleError( e );
  }
};

const deleteComments = async (
  id: number,
  opts: any = {}
): Promise<any> => {
  try {
    const { results } = await inatjs.comments.delete( { id }, opts );
    return results;
  } catch ( e ) {
    return handleError( e );
  }
};

export {
  createComment,
  deleteComments,
  updateComment
};
