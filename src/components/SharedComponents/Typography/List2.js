// @flow

import type { Node } from "react";
import React from "react";

import INatTextRegular from "./INatTextRegular";

const List2 = ( props: any ): Node => (
  <INatTextRegular
    className="text-sm leading-[17px] font-light text-darkGray"
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

export default List2;
