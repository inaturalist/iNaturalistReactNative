import { tailwindFontBold } from "appConstants/fontFamilies";
import React from "react";
import { TextProps } from "react-native";

import InatText from "./InatText";

const Heading2 = ( props: TextProps ) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <InatText className={`text-2xl ${tailwindFontBold}`} {...props} />
);

export default Heading2;
