// @flow

import type { Node } from "react";
import React from "react";

import INatText from "./INatText";

const Heading3 = ( props: any ): Node => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <INatText className="text-lg font-semibold text-darkGray" {...props} />
);

export default Heading3;
