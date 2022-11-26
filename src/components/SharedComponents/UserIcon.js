// @flow

import { Image } from "components/styledComponents";
import * as React from "react";

type Props = {
  uri: Object
}

const UserIcon = ( { uri }: Props ): React.Node => (
  <Image
    className="w-14 h-14 rounded-full"
    source={uri}
    testID="UserIcon.photo"
  />
);

export default UserIcon;
