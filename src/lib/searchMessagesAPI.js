// @flow

import inatjs from "inaturalistjs";

import MESSAGE_FIELDS from "../providers/fields";

const searchMessages = async ( options: Object ): Promise<any> => {
  const params = {
    page: 1,
    fields: MESSAGE_FIELDS
  };

  try {
    const { results } = await inatjs.messages.search( params, options );
    return results;
  } catch ( e ) {
    throw new Error( JSON.stringify( e.response ) );
  }
};

export default searchMessages;
