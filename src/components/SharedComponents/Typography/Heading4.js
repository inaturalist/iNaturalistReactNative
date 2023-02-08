// @flow

import type { Node } from "react";
import React from "react";

import INatText from "./INatText";

const Heading4 = ( props: any ): Node => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <INatText className="text-md leading-[19px] font-semibold" {...props} />
);

export default Heading4;
