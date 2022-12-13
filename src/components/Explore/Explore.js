// @flow

import PlaceholderText from "components/PlaceholderText";
import ViewWithFooter from "components/SharedComponents/ViewWithFooter";
import type { Node } from "react";
import React from "react";

const Explore = ( ): Node => (
  <ViewWithFooter>
    <PlaceholderText text="explore placeholder, accessible from left side menu" />
  </ViewWithFooter>
);

export default Explore;
