// @flow

import type { Node } from "react";
import React from "react";

import INatText from "./INatText";

const Heading1 = ( props: any ): Node => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <INatText className="text-3xl font-semibold text-darkGray" {...props} />
);

export default Heading1;
