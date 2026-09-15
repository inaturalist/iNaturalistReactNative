import { tailwindFontBold } from "appConstants/fontFamilies";
import classnames from "classnames";
import React from "react";

import InatText from "./InatText";
import type { TypographyProps } from "./types";

const Heading1 = ( props: TypographyProps ) => (
  <InatText
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
    className={classnames( "text-3xl tracking-tight", tailwindFontBold, props.className )}
  />
);

export default Heading1;
