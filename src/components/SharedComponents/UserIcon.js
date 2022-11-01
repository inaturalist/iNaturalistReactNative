// @flow

import { Image } from "components/styledComponents";
import * as React from "react";

type Props = {
  uri: Object,
  // large?: boolean
}

const UserIcon = ( { uri }: Props ): React.Node => (
  <Image
    className="w-12 h-12 rounded-full"
    source={uri}
    testID="UserIcon.photo"
  />
);

export default UserIcon;
