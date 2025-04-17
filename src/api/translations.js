// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

const fetchAvailableLocales = async (
  params: Object = {},
  opts: Object = {}
): Promise<?Object> => {
  try {
    const response = await inatjs.translations.locales( params, opts );
    if ( !response ) { return null; }
    return response?.results;
  } catch ( e ) {
    return handleError( e, { context: { functionName: "fetchAvailableLocales", opts } } );
  }
};

export default fetchAvailableLocales;
