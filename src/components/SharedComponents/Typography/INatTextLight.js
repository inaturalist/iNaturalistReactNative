// @flow

import { LightText } from "components/styledComponents";
import type { Node } from "react";
import React from "react";

type Props = {
  children: any,
  testID?: string,
  style?: any
}

const INatTextLight = ( { children, testID, style }: Props ): Node => (
  <LightText
    style={style}
    testID={testID}
  >
    {children}
  </LightText>
);

export default INatTextLight;
