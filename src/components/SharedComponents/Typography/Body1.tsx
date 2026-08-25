import { tailwindFontMedium } from "appConstants/fontFamilies";
import classnames from "classnames";
import React from "react";
import type { TextProps } from "react-native";

import InatText from "./InatText";

// This is the same as List1 Typography in Figma
const Body1 = ( props: TextProps ) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <InatText {...props} className={classnames( "text-base", tailwindFontMedium, props.className )} />
);

export default Body1;
