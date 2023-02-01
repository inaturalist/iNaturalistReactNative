// @flow

import type { Node } from "react";
import React from "react";

import INatTextLight from "./INatTextLight";

// eslint-disable-next-line react/jsx-props-no-spreading
const Subheading1 = ( props: any ): Node => <INatTextLight className="text-xl" {...props} />;

export default Subheading1;
