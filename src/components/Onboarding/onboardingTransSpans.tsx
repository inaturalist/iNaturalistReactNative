import { tailwindFontBold } from "appConstants/fontFamilies";
import { Text } from "components/styledComponents";
import React from "react";

// <Trans> components for onboarding strings tagged <0>plain</0><1>emphasized</1>.
// Each renders as nested Text, so it inherits the surrounding text's styles.

// For strings whose <1> spans are bold
export const BOLD_SPANS = [
  <Text key="0" />,
  <Text key="1" className={tailwindFontBold} />,
];

// For headlines whose <1> span is underlined for emphasis
export const UNDERLINED_SPANS = [
  <Text key="0" />,
  <Text key="1" className="underline" />,
];
