// @flow

import type { Node } from "react";
import React from "react";

import INatTextLight from "./INatTextLight";

const List2 = ( props: any ): Node => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <INatTextLight className="text-sm leading-[17px] font-light" {...props} />
);

export default List2;
