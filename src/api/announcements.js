// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

const ANNOUNCEMENTS_FIELDS = {
  id: true,
  body: true,
  dismissible: true,
  start: true,
  placement: true
};

const PARAMS = {
  fields: ANNOUNCEMENTS_FIELDS,
  placement: "mobile"
};

const searchAnnouncements = async ( params: Object = {}, opts: Object = {} ): Promise<?Object> => {
  try {
    const { results } = await inatjs.announcements.search(
      { ...PARAMS, ...params },
      opts
    );
    return results;
  } catch ( e ) {
    return handleError( e, { context: { functionName: "searchAnnouncements", opts } } );
  }
};

const dismissAnnouncement = async ( params: Object = {}, opts: Object = {} ): Promise<?number> => {
  try {
    return await inatjs.announcements.dismiss( params, opts );
  } catch ( e ) {
    return handleError( e, { context: { functionName: "dismissAnnouncement", opts } } );
  }
};

export { dismissAnnouncement, searchAnnouncements };
