import inatjs from "inaturalistjs";
import User from "realmModels/User.ts";

import handleError from "./error";

const MESSAGE_FIELDS = {
  subject: true,
  body: true,
  from_user: User.FIELDS,
  to_user: User.FIELDS
};

const PARAMS = {
  fields: MESSAGE_FIELDS
};

const searchMessages = async ( params: Object = {}, opts: Object = {} ): Promise<Object> => {
  try {
    const { results } = await inatjs.messages.search( { ...PARAMS, ...params }, opts );
    return results;
  } catch ( e ) {
    return handleError( e as Error, { context: { functionName: "searchMessages", opts } } );
  }
};

export default searchMessages;
