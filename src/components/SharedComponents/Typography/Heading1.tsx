import { tailwindFontBold } from "appConstants/fontFamilies";
import React from "react";
import { TextProps } from "react-native";

import InatText from "./InatText";

const Heading1 = ( props: TextProps ) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <InatText className={`text-3xl tracking-tight ${tailwindFontBold}`} {...props} />
);

export default Heading1;
