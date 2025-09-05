import { tailwindFontBold } from "appConstants/fontFamilies";
import React from "react";
import { TextProps } from "react-native";

import InatText from "./InatText";

const Heading4 = ( props: TextProps ) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <InatText className={`text-md tracking-widest ${tailwindFontBold}`} {...props} />
);

export default Heading4;
