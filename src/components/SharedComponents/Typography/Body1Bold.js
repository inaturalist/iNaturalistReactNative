// @flow

import type { Node } from "react";
import React from "react";

import INatText from "./INatText";

const Body1Bold = ( props: any ): Node => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <INatText className="text-base font-medium text-darkGray" {...props} />
);

export default Body1Bold;
