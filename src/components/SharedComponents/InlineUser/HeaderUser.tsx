// Directly imported, not from index.js to avoid circular dependency
import Heading3 from "components/SharedComponents/Typography/Heading3";
import React from "react";
import type { UserPojo } from "realmModels/User";

import InlineUserBase from "./InlineUserBase";

interface Props {
  user: UserPojo;
  isConnected: boolean;
}

const HeaderUser = ( { user, isConnected }: Props ) => (
  <InlineUserBase
    user={user}
    isConnected={isConnected}
    TextComponent={Heading3}
    testID="HeaderUser"
    useBigIcon
  />
);

export default HeaderUser;
