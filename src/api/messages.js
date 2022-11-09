// @flow

import inatjs from "inaturalistjs";
import User from "realmModels/User";

import handleError from "./error";

const MESSAGE_FIELDS = {
  subject: true,
  body: true,
  from_user: User.USER_FIELDS,
  to_user: User.USER_FIELDS
};

const PARAMS = {
  fields: MESSAGE_FIELDS
};

const searchMessages = async ( params: Object = {}, opts: Object = {} ): Promise<any> => {
  try {
    const { results } = await inatjs.messages.search( { ...PARAMS, ...params }, opts );
    return results;
  } catch ( e ) {
    return handleError( e );
  }
};

export default searchMessages;
