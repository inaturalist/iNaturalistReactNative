import { tailwindFontRegular } from "appConstants/fontFamilies";
import classnames from "classnames";
import React from "react";
import type { TextProps } from "react-native";

import InatText from "./InatText";

const Subheading1 = ( props: TextProps ) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <InatText {...props} className={classnames( "text-xl", tailwindFontRegular, props.className )} />
);

export default Subheading1;
