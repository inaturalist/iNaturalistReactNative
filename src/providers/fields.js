// @flow

import User from "realmModels/User";

export default {
  subject: true,
  body: true,
  from_user: User.USER_FIELDS,
  to_user: User.USER_FIELDS
};
