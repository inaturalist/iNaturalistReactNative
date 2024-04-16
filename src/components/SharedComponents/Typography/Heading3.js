// @flow

import type { Node } from "react";
import React from "react";

import INatTextBold from "./INatTextBold";

const Heading3 = ( props: any ): Node => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <INatTextBold className="text-lg font-semibold text-darkGray" {...props} />
);

export default Heading3;
