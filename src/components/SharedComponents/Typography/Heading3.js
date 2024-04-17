// @flow

import classnames from "classnames";
import {
  tailwindFontBold
} from "constants/fontFamilies.ts";
import type { Node } from "react";
import React from "react";
import { Text } from "react-native";

const Heading3 = ( props: any ): Node => (
  <Text
    className={classnames(
      "text-lg font-semibold text-darkGray",
      tailwindFontBold
    )}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

export default Heading3;
