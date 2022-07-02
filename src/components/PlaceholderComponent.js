// @flow

import React from "react";
import ViewWithFooter from "./SharedComponents/ViewWithFooter";
import type { Node } from "react";
import PlaceholderText from "./PlaceholderText";

const PlaceholderComponent = ( ): Node => (
  <ViewWithFooter>
    <PlaceholderText text="placeholder, accessible from left side menu" />
  </ViewWithFooter>
);

export default PlaceholderComponent;
