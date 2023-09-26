// @flow

import type { Node } from "react";
import React from "react";

import INatText from "./INatText";

const Body3Bold = ( props: any ): Node => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <INatText className="text-sm font-medium text-darkGray" {...props} />
);

export default Body3Bold;
