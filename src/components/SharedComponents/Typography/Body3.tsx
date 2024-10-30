import { tailwindFontMedium } from "appConstants/fontFamilies.ts";
import React from "react";
import { TextProps } from "react-native";

import InatText from "./InatText";

const Body3 = ( props: TextProps ) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <InatText className={`text-xs ${tailwindFontMedium}`} {...props} />
);

export default Body3;
