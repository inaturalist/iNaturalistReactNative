// @flow

import React from "react";
import { Text } from "react-native";
import ViewWithFooter from "./SharedComponents/ViewWithFooter";
import type { Node } from "react";

const PlaceholderComponent = ( ): Node => (
  <ViewWithFooter>
    <Text>placeholder, accessible from left side menu</Text>
  </ViewWithFooter>
);

export default PlaceholderComponent;
