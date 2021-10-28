// @flow

import * as React from "react";
import { Image } from "react-native";

import { imageStyles } from "../../styles/obsDetails";

type Props = {
  uri: string
}

const SmallUserIcon = ( { uri }: Props ): React.Node => {
  const imageSource = { uri };

  return (
    <Image source={imageSource} style={imageStyles.userProfileIcon} />
  );
};

export default SmallUserIcon;
