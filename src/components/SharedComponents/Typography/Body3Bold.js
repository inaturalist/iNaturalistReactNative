// @flow

import type { Node } from "react";
import React from "react";

import INatTextBold from "./INatTextBold";

const Body3Bold = ( props: any ): Node => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <INatTextBold className="text-sm font-medium text-darkGray" {...props} />
);

export default Body3Bold;
