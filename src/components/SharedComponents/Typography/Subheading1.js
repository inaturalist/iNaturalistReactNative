// @flow

import type { Node } from "react";
import React from "react";

import INatTextRegular from "./INatTextRegular";

const Subheading1 = ( props: any ): Node => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <INatTextRegular className="text-xl text-darkGray font-Lato-Medium" {...props} />
);

export default Subheading1;
