import { tailwindFontBold } from "appConstants/fontFamilies.ts";
import React from "react";
import { TextProps } from "react-native";

import InatText from "./InatText";

const Heading3 = ( props: TextProps ) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <InatText className={`text-lg ${tailwindFontBold}`} {...props} />
);

export default Heading3;
