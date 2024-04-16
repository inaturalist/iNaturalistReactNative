// @flow

import type { Node } from "react";
import React from "react";

import INatTextRegular from "./INatTextRegular";

const Body2 = ( props: any ): Node => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <INatTextRegular className="text-md font-light text-darkGray" {...props} />
);

export default Body2;
