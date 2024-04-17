// @flow

import {
  tailwindFontBold
} from "appConstants/fontFamilies.ts";
import classnames from "classnames";
import type { Node } from "react";
import React from "react";
import { Text } from "react-native";

const Link = ( props: any ): Node => (
  <Text
    className={classnames(
      "text-md text-darkGray underline",
      tailwindFontBold
    )}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

export default Link;
