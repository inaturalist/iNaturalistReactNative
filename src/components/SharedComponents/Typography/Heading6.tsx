import { tailwindFontBold } from "appConstants/fontFamilies";
import classnames from "classnames";
import React from "react";
import type { TextProps } from "react-native";

import InatText from "./InatText";

const Heading6 = ( props: TextProps ) => (
  <InatText
    {...props}
    className={classnames( "text-3xs tracking-wide", tailwindFontBold, props.className )}
  />
);

export default Heading6;
