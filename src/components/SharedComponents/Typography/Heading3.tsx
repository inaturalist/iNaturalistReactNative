import { tailwindFontBold } from "appConstants/fontFamilies";
import classnames from "classnames";
import React from "react";

import InatText from "./InatText";
import type { TypographyProps } from "./types";

const Heading3 = ( props: TypographyProps ) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <InatText {...props} className={classnames( "text-lg", tailwindFontBold, props.className )} />
);

export default Heading3;
