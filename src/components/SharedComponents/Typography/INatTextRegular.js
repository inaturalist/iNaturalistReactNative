// @flow

import { RegularText } from "components/styledComponents";
import type { Node } from "react";
import React from "react";

type Props = {
  children: any,
};

/* eslint-disable react/jsx-props-no-spreading */
const INatTextRegular = ( { children, ...props }: Props ): Node => (
  <RegularText {...props}>{children}</RegularText>
);

export default INatTextRegular;
