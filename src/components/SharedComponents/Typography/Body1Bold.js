// @flow

import {
  tailwindFontMedium
} from "appConstants/fontFamilies.ts";
import classnames from "classnames";
import type { Node } from "react";
import React from "react";
import { Text } from "react-native";

const Body1Bold = ( props: any ): Node => (
  <Text
    className={classnames(
      "text-base font-medium text-darkGray",
      tailwindFontMedium
    )}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

export default Body1Bold;
