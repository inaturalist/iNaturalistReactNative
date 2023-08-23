// @flow

import type { Node } from "react";
import React from "react";

import INatText from "./INatText";

const Heading4 = ( props: any ): Node => (
  <INatText
    className="text-md leading-[19px] tracking-[2px] text-darkGray"
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

export default Heading4;
