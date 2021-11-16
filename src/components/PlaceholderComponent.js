// @flow

import * as React from "react";
import { Text } from "react-native";
import ViewWithFooter from "./SharedComponents/ViewWithFooter";

const PlaceholderComponent = ( ): React.Node => (
  <ViewWithFooter>
    <Text>placeholder, accessible from left side menu</Text>
  </ViewWithFooter>
);

export default PlaceholderComponent;
