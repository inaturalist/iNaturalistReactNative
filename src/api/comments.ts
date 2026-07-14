import { makeApiCall, makeApiCallById } from "api/makeApiCall";
import inatjs from "inaturalistjs";
import Comment from "realmModels/Comment";

const PARAMS = {
  fields: Comment.COMMENT_FIELDS,
};

const createComment = makeApiCall( inatjs.comments.create, {
  functionName: "createComment",
  defaultParams: PARAMS,
  extract: "results",
} );

const updateComment = makeApiCall( inatjs.comments.update, {
  functionName: "updateComment",
  defaultParams: PARAMS,
  extract: "results",
} );

const deleteComments = makeApiCallById( inatjs.comments.delete, {
  functionName: "deleteComments",
  extract: "results",
} );

export {
  createComment,
  deleteComments,
  updateComment,
};
