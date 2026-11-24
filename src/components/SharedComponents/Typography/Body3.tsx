import { tailwindFontMedium } from "appConstants/fontFamilies";
import classnames from "classnames";
import React from "react";
import type { TextProps } from "react-native";

import InatText from "./InatText";

const Body3 = ( props: TextProps ) => (
  <InatText {...props} className={classnames( "text-xs", tailwindFontMedium, props.className )} />
);

export default Body3;
