// @flow

import { Image } from "components/styledComponents";
import * as React from "react";

type Props = {
  uri: Object,
  small?: boolean
}

const UserIcon = ( { uri, small }: Props ): React.Node => {
  const className = small
    ? "w-[22px] h-[22px] rounded-full"
    : "w-[40px] h-[40px] rounded-full";
  return (
    <Image
      testID="UserIcon.photo"
      className={className}
      source={uri}
    />
  );
};

export default UserIcon;
