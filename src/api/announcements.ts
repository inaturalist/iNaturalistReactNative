import { makeApiCall } from "api/makeApiCall";
import inatjs from "inaturalistjs";

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

const searchAnnouncements = makeApiCall( inatjs.announcements.search, {
  functionName: "searchAnnouncements",
  defaultParams: PARAMS,
  extract: "results",
} );

const dismissAnnouncement = makeApiCall( inatjs.announcements.dismiss, {
  functionName: "dismissAnnouncement",
} );

export { dismissAnnouncement, searchAnnouncements };
