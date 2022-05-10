// @flow

import * as React from "react";
import { Image } from "react-native";

import { imageStyles } from "../../styles/obsDetails/obsDetails";

type Props = {
  uri: Object
}

const UserIcon = ( { uri }: Props ): React.Node => (
  <Image source={uri} style={imageStyles.squareImage} />
);

export default UserIcon;
