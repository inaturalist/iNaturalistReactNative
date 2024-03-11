// @flow

import type { Node } from "react";
import React from "react";

import INatTextMedium from "./INatTextMedium";

const Body3 = ( props: any ): Node => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <INatTextMedium className="text-sm font-normal text-darkGray" {...props} />
);

export default Body3;
