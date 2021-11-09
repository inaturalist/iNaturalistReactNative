// @flow

import * as React from "react";
import { Image } from "react-native";

import { imageStyles } from "../../styles/obsDetails";

type Props = {
  uri: string,
  large?: boolean
}

const UserIcon = ( { uri, large }: Props ): React.Node => {
  const imageSource = { uri };

  return (
    <Image source={imageSource} style={[
      imageStyles.userProfileIcon,
      large && imageStyles.largeIcon
    ]} />
  );
};

export default UserIcon;
