import { tailwindFontBold } from "appConstants/fontFamilies";
import React from "react";
import type { TextProps } from "react-native";

import InatText from "./InatText";

const UnderlinedLink = ( props: TextProps ) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <InatText className={`text-md underline ${tailwindFontBold}`} {...props} />
);

export default UnderlinedLink;
