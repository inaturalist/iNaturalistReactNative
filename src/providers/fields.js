// @flow

import User from "../models/User";

const MESSAGE_FIELDS = {
  subject: true,
  body: true,
  from_user: User.USER_FIELDS,
  to_user: User.USER_FIELDS
};

export {
  MESSAGE_FIELDS
};
