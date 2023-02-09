// @flow

import type { Node } from "react";
import React from "react";

import INatTextLight from "./INatTextLight";

const Body3 = ( props: any ): Node => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <INatTextLight className="text-sm font-normal color-darkGray" {...props} />
);

export default Body3;
