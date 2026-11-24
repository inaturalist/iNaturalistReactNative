import { tailwindFontBold } from "appConstants/fontFamilies";
import classnames from "classnames";
import React from "react";
import type { TextProps } from "react-native";

import InatText from "./InatText";

const UnderlinedLink = ( props: TextProps ) => (
  <InatText
    {...props}
    className={classnames( "text-md underline", tailwindFontBold, props.className )}
  />
);

export default UnderlinedLink;
