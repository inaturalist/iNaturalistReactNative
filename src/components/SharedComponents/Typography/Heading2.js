// @flow

import type { Node } from "react";
import React from "react";

import INatText from "./INatText";

const Heading2 = ( props: any ): Node => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <INatText className="text-2xl font-semibold" {...props} />
);

export default Heading2;
