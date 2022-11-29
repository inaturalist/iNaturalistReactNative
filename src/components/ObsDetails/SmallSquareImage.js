// @flow

import { Image } from "components/styledComponents";
import * as React from "react";

type Props = {
  uri: Object
}

const UserIcon = ( { uri }: Props ): React.Node => (
  <Image source={uri} className="w-12 h-12 rounded-xl mr-3" />
);

export default UserIcon;
