import { tailwindFontRegular } from "appConstants/fontFamilies";
import React from "react";
import { Text } from "react-native";
import { twMerge } from "tailwind-merge";

import resolveFontClassName from "./fontResolver";
import { TYPOGRAPHY_CLASSES } from "./InatText";
import type { TypographyProps } from "./types";

const List2 = ( { className, ...props }: TypographyProps ) => (
  <Text
    maxFontSizeMultiplier={2}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
    // TODO: figure out why this doesn't use inatText
    className={resolveFontClassName( twMerge(
      ...TYPOGRAPHY_CLASSES,
      "text-sm",
      tailwindFontRegular,
      className,
    ) )}
  />
);

export default List2;
