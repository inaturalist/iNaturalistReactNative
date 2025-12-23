// Wrapper around Text w/ app-specific defaults
import {
  tailwindFontRegular,
} from "appConstants/fontFamilies";
import classnames from "classnames";
import type { ComponentPropsWithoutRef } from "react";
import React from "react";
import { Text } from "react-native";

export const TYPOGRAPHY_CLASSES = [
  "text-darkGray",
  "trailing-tight",
];

export const TYPOGRAPHY_STYLE = {
  // Explicitly declaring this as a default allows RN's RTL support to flip it
  // for RTL languages. For some reason it doesn't work with text-left or
  // text-start as a tailwind class
  textAlign: "left",
};

const InatText = ( props: ComponentPropsWithoutRef<typeof Text> ) => (
  <Text
    maxFontSizeMultiplier={2}
    className={classnames(
      TYPOGRAPHY_CLASSES,
      tailwindFontRegular,
      props.className,
    )}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
    style={[
      TYPOGRAPHY_STYLE,
      props.style,
    ]}
  />
);

export default InatText;
