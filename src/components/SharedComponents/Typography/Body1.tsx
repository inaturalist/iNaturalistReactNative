import { tailwindFontMedium } from "appConstants/fontFamilies";
import React from "react";
import { TextProps } from "react-native";

import InatText from "./InatText";

// This is the same as List1 Typography in Figma
const Body1 = ( props: TextProps ) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <InatText className={`text-base ${tailwindFontMedium}`} {...props} />
);

export default Body1;
