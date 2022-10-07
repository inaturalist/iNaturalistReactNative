// @flow

import * as React from "react";
import { Image } from "react-native";
import { imageStyles } from "styles/obsDetails/obsDetails";

type Props = {
  uri: Object,
  large?: boolean
}

const UserIcon = ( { uri, large }: Props ): React.Node => (
  <Image
    source={uri}
    style={[
      imageStyles.userProfileIcon,
      large && imageStyles.largeIcon
    ]}
    testID="UserIcon.photo"
  />
);

export default UserIcon;
