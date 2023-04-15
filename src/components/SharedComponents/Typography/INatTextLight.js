// @flow

import { LightText } from "components/styledComponents";
import type { Node } from "react";
import React from "react";

type Props = {
  children: any,
};

/* eslint-disable react/jsx-props-no-spreading */
const INatTextLight = ( { children, ...props }: Props ): Node => (
  <LightText {...props}>{children}</LightText>
);

export default INatTextLight;
