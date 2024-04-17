// @flow

import {
  tailwindFontRegular
} from "appConstants/fontFamilies.ts";
import classnames from "classnames";
import type { Node } from "react";
import React from "react";
import { Text } from "react-native";

const List2 = ( props: any ): Node => (
  <Text
    className={classnames(
      "text-sm trailing-tight text-darkGray",
      tailwindFontRegular
    )}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

export default List2;
