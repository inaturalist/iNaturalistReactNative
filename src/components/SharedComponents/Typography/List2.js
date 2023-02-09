// @flow

import type { Node } from "react";
import React from "react";

import INatTextLight from "./INatTextLight";

const List2 = ( props: any ): Node => (
  <INatTextLight
    className="text-sm leading-[17px] font-light color-darkGray"
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

export default List2;
