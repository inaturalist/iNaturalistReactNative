// Wrapper around Text w/ app-specific defaults
import {
  tailwindFontRegular,
} from "appConstants/fontFamilies";
import type { ComponentProps } from "react";
import React from "react";
import { Text } from "react-native";
import { twMerge } from "tailwind-merge";

export const TYPOGRAPHY_CLASSES = [
  "text-darkGray",
  "trailing-tight",
] as const;

export const TYPOGRAPHY_STYLE = {
  // Explicitly declaring this as a default allows RN's RTL support to flip it
  // for RTL languages. For some reason it doesn't work with text-left or
  // text-start as a tailwind class
  textAlign: "left",
} as const;

const TEXT_ALIGN_CLASS = /(?:^|\s)text-(?:left|center|right|justify|start|end)(?:\s|$)/;

// In nativewind 4, conflicting classes on one element resolve by stylesheet
// order, not className order, so these defaults must be merged with twMerge
// (later class wins per property) for caller classes to override them
const InatText = ( { className, style, ...props }: ComponentProps<typeof Text> ) => {
  const mergedClassName = twMerge(
    ...TYPOGRAPHY_CLASSES,
    tailwindFontRegular,
    className,
  );
  return (
    <Text
      maxFontSizeMultiplier={2}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      className={mergedClassName}
      style={[
        // The textAlign default is an inline style, which beats classes in
        // nativewind 4, so skip it when the caller aligns with a class
        TEXT_ALIGN_CLASS.test( mergedClassName )
          ? undefined
          : TYPOGRAPHY_STYLE,
        style,
      ]}
    />
  );
};

export default InatText;
