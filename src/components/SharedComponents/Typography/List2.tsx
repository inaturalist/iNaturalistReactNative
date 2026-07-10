import { tailwindFontRegular } from "appConstants/fontFamilies";
import React from "react";
import type { TextProps } from "react-native";
import { Text } from "react-native";
import { twMerge } from "tailwind-merge";

import { TYPOGRAPHY_CLASSES } from "./InatText";

const List2 = ( { className, ...props }: TextProps ) => (
  <Text
    maxFontSizeMultiplier={2}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
    className={twMerge(
      ...TYPOGRAPHY_CLASSES,
      "text-sm",
      tailwindFontRegular,
      className,
    )}
  />
);

export default List2;
