// @flow

import type { Node } from "react";
import React from "react";

import INatText from "./INatText";

const Heading5 = ( props: any ): Node => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <INatText className="text-2xs font-semibold tracking-[1px]" {...props} />
);

export default Heading5;
