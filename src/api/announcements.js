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

const searchAnnouncements = async ( params: object = {}, opts: object = {} ): Promise<any> => {
  try {
    const { results } = await inatjs.announcements.search(
      { ...PARAMS, ...params },
      opts
    );
    return results;
  } catch ( e ) {
    return handleError( e );
  }
};

const dismissAnnouncement = async ( params: object = {}, opts: object = {} ): Promise<?number> => {
  try {
    return await inatjs.announcements.dismiss( params, opts );
  } catch ( e ) {
    return handleError( e );
  }
};

export { dismissAnnouncement, searchAnnouncements };
