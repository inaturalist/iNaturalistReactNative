// @flow

import type { Node } from "react";
import React from "react";

import INatTextBold from "./INatTextBold";

const Heading5 = ( props: any ): Node => (
  <INatTextBold
    className="text-2xs font-semibold tracking-[1px] text-darkGray"
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

export default Heading5;
