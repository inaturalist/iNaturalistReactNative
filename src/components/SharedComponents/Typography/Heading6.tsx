import { tailwindFontBold } from "appConstants/fontFamilies";
import classnames from "classnames";
import React from "react";

import InatText from "./InatText";
import type { TypographyProps } from "./types";

const Heading6 = ( props: TypographyProps ) => (
  <InatText
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
    className={classnames( "text-3xs tracking-wide", tailwindFontBold, props.className )}
  />
);

export default Heading6;
