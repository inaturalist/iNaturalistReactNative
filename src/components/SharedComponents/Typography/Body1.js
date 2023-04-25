// @flow

import type { Node } from "react";
import React from "react";

import INatTextLight from "./INatTextLight";

const Body1 = ( props: any ): Node => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <INatTextLight className="text-base font-medium text-darkGray" {...props} />
);

export default Body1;
