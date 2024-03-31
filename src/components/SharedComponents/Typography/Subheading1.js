// @flow

import type { Node } from "react";
import React from "react";

import INatTextLight from "./INatTextLight";

const Subheading1 = ( props: any ): Node => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <INatTextLight className="text-xl text-darkGray" {...props} />
);

export default Subheading1;
