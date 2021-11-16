// @flow

import * as React from "react";
import { Text } from "react-native";
import ViewWithFooter from "./SharedComponents/ViewWithFooter";

const PlaceholderComponent = ( ): React.Node => (
  <ViewWithFooter>
    <Text>screen placeholder, accessible from side menu</Text>
  </ViewWithFooter>
);

export default PlaceholderComponent;
