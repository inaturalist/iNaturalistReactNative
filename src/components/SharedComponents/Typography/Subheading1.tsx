import {
  tailwindFontRegular
} from "appConstants/fontFamilies.ts";
import classnames from "classnames";
import React, { ComponentPropsWithoutRef } from "react";
import { Text } from "react-native";

const Subheading1 = ( props: ComponentPropsWithoutRef<typeof Text> ) => (
  <Text
    maxFontSizeMultiplier={2}
    className={classnames(
      "text-xl trailing-tight text-darkGray",
      tailwindFontRegular
    )}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

export default Subheading1;
