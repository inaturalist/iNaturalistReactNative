// @flow

// Directly imported, not from index.js to avoid circular dependency
import Body3 from "components/SharedComponents/Typography/Body3.tsx";
import type { Node } from "react";
import React from "react";

import InlineUserBase from "./InlineUserBase";

type Props = {
  user: {
    id: number,
    icon_url?: string,
    login: string
  },
  isConnected: boolean
};

const InlineUser = ( { user, isConnected }: Props ): Node => (
  <InlineUserBase
    user={user}
    isConnected={isConnected}
    TextComponent={Body3}
    testID="InlineUser"
  />
);

export default InlineUser;
