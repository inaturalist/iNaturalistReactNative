// @flow

import {
  tailwindFontMedium
} from "appConstants/fontFamilies.ts";
import classnames from "classnames";
import type { Node } from "react";
import React from "react";
import { Text } from "react-native";

// This is the same as List1 Typography in Figma
const Body1 = ( props: Object ): Node => (
  <Text
    className={classnames(
      "text-base trailing-tight text-darkGray",
      tailwindFontMedium
    )}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

export default Body1;
