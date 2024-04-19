// @flow

import {
  tailwindFontRegular
} from "appConstants/fontFamilies.ts";
import classnames from "classnames";
import type { Node } from "react";
import React from "react";
import { Text } from "react-native";

const Body2 = ( props: Object ): Node => (
  <Text
    className={classnames(
      "text-md trailing-tight text-darkGray",
      tailwindFontRegular
    )}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

export default Body2;
