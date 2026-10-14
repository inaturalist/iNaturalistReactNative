import inatjs from "inaturalistjs";

import type { ErrorWithResponse } from "./error";
import handleError from "./error";
import type { ApiOpts, ApiUntypedParams } from "./types";

const ANNOUNCEMENTS_FIELDS = {
  id: true,
  body: true,
  dismissible: true,
  start: true,
  placement: true,
};

const PARAMS = {
  fields: ANNOUNCEMENTS_FIELDS,
  placement: "mobile",
};

const searchAnnouncements = async ( params: ApiUntypedParams = {}, opts: ApiOpts = {} ) => {
  try {
    const { results } = await inatjs.announcements.search(
      { ...PARAMS, ...params },
      opts,
    );
    return results;
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "searchAnnouncements", opts } },
    );
  }
};

const dismissAnnouncement = async ( params: ApiUntypedParams = {}, opts: ApiOpts = {} ) => {
  try {
    return await inatjs.announcements.dismiss( params, opts );
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "dismissAnnouncement", opts } },
    );
  }
};

export { dismissAnnouncement, searchAnnouncements };
