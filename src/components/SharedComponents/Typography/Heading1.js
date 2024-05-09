// @flow

import {
  tailwindFontBold
} from "appConstants/fontFamilies.ts";
import classnames from "classnames";
import type { Node } from "react";
import React from "react";
import { Text } from "react-native";

const Heading1 = ( props: Object ): Node => (
  <Text
    className={classnames(
      "text-3xl tracking-tight text-darkGray",
      tailwindFontBold
    )}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

export default Heading1;
