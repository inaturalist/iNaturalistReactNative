import React from "react";
import { Image } from "react-native";

import { imageStyles } from "../../styles/obsDetails";

type Props = {
  uri: string
}

const SmallUserIcon = ( { uri }: Props ) => {
  const imageSource = { uri };

  return (
    <Image source={imageSource} style={imageStyles.userProfileIcon} />
  );
};

export default SmallUserIcon;
