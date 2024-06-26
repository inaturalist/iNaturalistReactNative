import {
  tailwindFontMedium
} from "appConstants/fontFamilies.ts";
import classnames from "classnames";
import React from "react";
import { Text, TextProps } from "react-native";

const Body3 = ( props: TextProps ) => (
  <Text
    className={classnames(
      "text-xs trailing-tight text-darkGray",
      tailwindFontMedium
    )}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

export default Body3;
