import { tailwindFontBold } from "appConstants/fontFamilies";
import React from "react";
import type { TextProps } from "react-native";

import InatText from "./InatText";

const Heading5 = ( props: TextProps ) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <InatText className={`text-2xs tracking-[2px] ${tailwindFontBold}`} {...props} />
);

export default Heading5;
