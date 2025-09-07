import { tailwindFontRegular } from "appConstants/fontFamilies";
import React from "react";
import { TextProps } from "react-native";

import InatText from "./InatText";

const Subheading1 = ( props: TextProps ) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <InatText className={`text-xl ${tailwindFontRegular}`} {...props} />
);

export default Subheading1;
