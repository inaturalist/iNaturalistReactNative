// @flow

import type { Node } from "react";
import React from "react";

import PlaceholderText from "./PlaceholderText";
import ViewWrapper from "./SharedComponents/ViewWrapper";

const PlaceholderComponent = (): Node => (
  <ViewWrapper>
    <PlaceholderText text="placeholder, accessible from left side menu" />
  </ViewWrapper>
);

export default PlaceholderComponent;
