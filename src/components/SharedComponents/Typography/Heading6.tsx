import { tailwindFontBold } from "appConstants/fontFamilies";
import React from "react";
import type { TextProps } from "react-native";

import InatText from "./InatText";

const Heading6 = ( props: TextProps ) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <InatText className={`text-3xs tracking-wide ${tailwindFontBold}`} {...props} />
);

export default Heading6;
