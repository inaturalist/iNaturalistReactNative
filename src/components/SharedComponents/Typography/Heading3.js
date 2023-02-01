// @flow

import type { Node } from "react";
import React from "react";

import INatText from "./INatText";

// eslint-disable-next-line react/jsx-props-no-spreading
const Heading3 = ( props: any ): Node => <INatText className="text-lg" {...props} />;

export default Heading3;
