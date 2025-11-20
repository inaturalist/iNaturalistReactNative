import { tailwindFontRegular } from "appConstants/fontFamilies";
import React from "react";
import type { TextProps } from "react-native";

import InatText from "./InatText";

const Body4 = ( props: TextProps ) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <InatText className={`text-2xs ${tailwindFontRegular}`} {...props} />
);

export default Body4;
