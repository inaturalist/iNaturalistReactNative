// @flow

import type { Node } from "react";
import React from "react";

import INatText from "./INatText";

// eslint-disable-next-line react/jsx-props-no-spreading
const Heading1 = ( props: any ): Node => <INatText className="text-3xl" {...props} />;

export default Heading1;
