import { tailwindFontBold } from "appConstants/fontFamilies";
import classnames from "classnames";
import React from "react";

import InatText from "./InatText";
import type { TypographyProps } from "./types";

const Subheading2 = ( props: TypographyProps ) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <InatText {...props} className={classnames( "text-xl", tailwindFontBold, props.className )} />
);

export default Subheading2;
