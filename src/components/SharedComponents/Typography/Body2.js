// @flow

import type { Node } from "react";
import React from "react";

import INatTextLight from "./INatTextLight";

const Body2 = ( props: any ): Node => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <INatTextLight className="text-md font-light" {...props} />
);

export default Body2;
