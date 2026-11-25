import { tailwindFontBold } from "appConstants/fontFamilies";
import classnames from "classnames";
import React from "react";
import type { TextProps } from "react-native";

import InatText from "./InatText";

const Heading3 = ( props: TextProps ) => (
  <InatText {...props} className={classnames( "text-lg", tailwindFontBold, props.className )} />
);

export default Heading3;
