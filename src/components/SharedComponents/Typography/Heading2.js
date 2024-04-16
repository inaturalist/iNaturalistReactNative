// @flow

import type { Node } from "react";
import React from "react";

import INatTextBold from "./INatTextBold";

const Heading2 = ( props: any ): Node => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <INatTextBold className="text-2xl font-semibold text-darkGray" {...props} />
);

export default Heading2;
