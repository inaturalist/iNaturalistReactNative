import { tailwindFontBold } from "appConstants/fontFamilies.ts";
import React from "react";
import { TextProps } from "react-native";

import InatText from "./InatText";

const Subheading2 = ( props: TextProps ) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <InatText className={`text-xl ${tailwindFontBold}`} {...props} />
);

export default Subheading2;
