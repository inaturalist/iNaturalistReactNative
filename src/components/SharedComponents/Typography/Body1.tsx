import { tailwindFontMedium } from "appConstants/fontFamilies";
import classnames from "classnames";
import React from "react";

import InatText from "./InatText";
import type { TypographyProps } from "./types";

// This is the same as List1 Typography in Figma
const Body1 = ( props: TypographyProps ) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <InatText {...props} className={classnames( "text-base", tailwindFontMedium, props.className )} />
);

export default Body1;
