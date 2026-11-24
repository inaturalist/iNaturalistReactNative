import { tailwindFontBold } from "appConstants/fontFamilies";
import classnames from "classnames";
import React from "react";
import type { TextProps } from "react-native";

import InatText from "./InatText";

const Subheading2 = ( props: TextProps ) => (
  <InatText {...props} className={classnames( "text-xl", tailwindFontBold, props.className )} />
);

export default Subheading2;
