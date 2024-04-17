// @flow

import classnames from "classnames";
import {
  tailwindFontMedium
} from "constants/fontFamilies.ts";
import type { Node } from "react";
import React from "react";
import { Text } from "react-native";

const Body1 = ( props: any ): Node => (
  <Text
    className={classnames(
      "text-base font-medium text-darkGray",
      tailwindFontMedium
    )}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

export default Body1;
