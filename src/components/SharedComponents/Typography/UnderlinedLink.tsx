import { tailwindFontBold } from "appConstants/fontFamilies";
import classnames from "classnames";
import React from "react";

import InatText from "./InatText";
import type { TypographyProps } from "./types";

const UnderlinedLink = ( props: TypographyProps ) => (
  <InatText
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
    className={classnames( "text-md underline", tailwindFontBold, props.className )}
  />
);

export default UnderlinedLink;
