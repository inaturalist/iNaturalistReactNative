// @flow

import type { Node } from "react";
import React from "react";
import { Text } from "react-native";
import colors from "styles/tailwindColors";

type Props = {
  text: string,
  style?: Array<object>
}

const PlaceholderText = ( { text, style }: Props ): Node => (
  <Text style={[{
    color: colors.warningRed,
    textTransform: "uppercase",
    fontSize: 30
  }].concat( style )}
  >
    { text }
  </Text>
);

export default PlaceholderText;
