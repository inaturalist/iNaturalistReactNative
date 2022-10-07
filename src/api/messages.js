// @flow

import inatjs from "inaturalistjs";
import MESSAGE_FIELDS from "providers/fields";

import handleError from "./error";

const searchMessages = async ( options: Object ): Promise<any> => {
  const params = {
    page: 1,
    fields: MESSAGE_FIELDS
  };

  try {
    const { results } = await inatjs.messages.search( params, options );
    return results;
  } catch ( e ) {
    return handleError( e );
  }
};

export default searchMessages;
