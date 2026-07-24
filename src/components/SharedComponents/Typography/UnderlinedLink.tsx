import { tailwindFontBold } from "appConstants/fontFamilies";
import classnames from "classnames";
import React from "react";
import type { TextProps } from "react-native";

import InatText from "./InatText";

const UnderlinedLink = ( props: TextProps ) => (
  <InatText
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
    className={classnames( "text-md underline", tailwindFontBold, props.className )}
  />
);

export default UnderlinedLink;
