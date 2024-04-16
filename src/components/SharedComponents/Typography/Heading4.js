// @flow

import type { Node } from "react";
import React from "react";

import INatTextBold from "./INatTextBold";

const Heading4 = ( props: any ): Node => (
  <INatTextBold
    className="text-md leading-[19px] font-semibold tracking-[2px] text-darkGray"
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

export default Heading4;
