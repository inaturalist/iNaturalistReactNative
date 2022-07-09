// @flow

import React from "react";
import { Text } from "react-native";
import type { Node } from "react";

type Props = {
  text: string,
  style?: Array<Object>
}

const PlaceholderText = ( { text, style }: Props ): Node => (
  <Text style={[{ color: "red", textTransform: "uppercase", fontSize: 30 }].concat( style )}>
    { text }
  </Text>
);

export default PlaceholderText;
