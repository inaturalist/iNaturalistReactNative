// @flow

import { LightText } from "components/styledComponents";
import type { Node } from "react";
import React from "react";

type Props = {
  children: any,
  testID?: string,
  style?: any
}

/* eslint-disable react/jsx-props-no-spreading */
const INatTextLight = ( {
  children, testID, style, ...props
}: Props ): Node => (
  <LightText
    style={style}
    testID={testID}
    {...props}
  >
    {children}
  </LightText>
);

export default INatTextLight;
