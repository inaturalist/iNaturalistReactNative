// @flow

import type { Node } from "react";
import React from "react";

import PlaceholderText from "./PlaceholderText";
import ViewWithFooter from "./SharedComponents/ViewWithFooter";

const PlaceholderComponent = ( ): Node => (
  <ViewWithFooter>
    <PlaceholderText text="placeholder, accessible from left side menu" />
  </ViewWithFooter>
);

export default PlaceholderComponent;
