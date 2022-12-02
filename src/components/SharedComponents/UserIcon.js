// @flow

import { Image } from "components/styledComponents";
import * as React from "react";

type Props = {
  uri: Object,
  small?: boolean
}

const UserIcon = ( { uri, small }: Props ): React.Node => {
  const className = small ? "w-10 h-10 rounded-full" : "w-14 h-14 rounded-full";
  return (
    <Image
      className={className}
      source={uri}
      testID="UserIcon.photo"
    />
  );
};

export default UserIcon;
