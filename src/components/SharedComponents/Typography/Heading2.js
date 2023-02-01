// @flow

import type { Node } from "react";
import React from "react";

import INatText from "./INatText";

// eslint-disable-next-line react/jsx-props-no-spreading
const Heading2 = ( props: any ): Node => <INatText className="text-2xl" {...props} />;

export default Heading2;
