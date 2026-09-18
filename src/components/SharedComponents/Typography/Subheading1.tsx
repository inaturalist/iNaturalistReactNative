import { tailwindFontRegular } from "appConstants/fontFamilies";
import classnames from "classnames";
import React from "react";

import InatText from "./InatText";
import type { TypographyProps } from "./types";

const Subheading1 = ( props: TypographyProps ) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <InatText {...props} className={classnames( "text-xl", tailwindFontRegular, props.className )} />
);

export default Subheading1;
