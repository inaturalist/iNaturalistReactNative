// @flow

import PlaceholderText from "components/PlaceholderText";
import ViewWrapper from "components/SharedComponents/ViewWrapper";
import type { Node } from "react";
import React from "react";

const Explore = (): Node => (
  <ViewWrapper>
    <PlaceholderText text="explore placeholder, accessible from left side menu" />
  </ViewWrapper>
);

export default Explore;
