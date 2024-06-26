import { tailwindFontRegular } from "appConstants/fontFamilies.ts";
import classnames from "classnames";
import React from "react";
import { Text, TextProps } from "react-native";

const List2 = ( props: TextProps ) => (
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
