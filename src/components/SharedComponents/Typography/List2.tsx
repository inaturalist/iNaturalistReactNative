import { tailwindFontRegular } from "appConstants/fontFamilies";
import classnames from "classnames";
import React from "react";
import type { TextProps } from "react-native";
import { Text } from "react-native";

import { TYPOGRAPHY_CLASSES } from "./InatText";

const List2 = ( props: TextProps ) => (
  <Text
    maxFontSizeMultiplier={2}
    className={classnames(
      TYPOGRAPHY_CLASSES,
      "text-sm",
      tailwindFontRegular,
    )}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

export default List2;
