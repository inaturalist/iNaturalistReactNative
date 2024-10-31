import {
  tailwindFontBold
} from "appConstants/fontFamilies.ts";
import classnames from "classnames";
import React from "react";
import { Text, TextProps } from "react-native";

const Heading2 = ( props:TextProps ) => (
  <Text
    maxFontSizeMultiplier={2}
    className={classnames(
      "text-2xl text-darkGray",
      tailwindFontBold
    )}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

export default Heading2;
