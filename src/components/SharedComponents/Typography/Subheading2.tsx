import { tailwindFontBold } from "appConstants/fontFamilies";
import React from "react";
import type { TextProps } from "react-native";

import InatText from "./InatText";

const Subheading2 = ( props: TextProps ) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <InatText className={`text-xl ${tailwindFontBold}`} {...props} />
);

export default Subheading2;
