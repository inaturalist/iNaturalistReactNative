// @flow

import classnames from "classnames";
import {
  tailwindFontRegular
} from "constants/fontFamilies.ts";
import type { Node } from "react";
import React from "react";
import { Text } from "react-native";

const Body4 = ( props: any ): Node => (
  <Text
    className={classnames(
      "text-xs font-light text-darkGray",
      tailwindFontRegular
    )}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

export default Body4;
