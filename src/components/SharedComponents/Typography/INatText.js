// @flow

import { Text } from "components/styledComponents";
import type { Node } from "react";
import React from "react";

type Props = {
  children: any,
  testID?: string,
  style?: any
}

const INatText = ( { children, testID, style }: Props ): Node => (
  <Text
    style={style}
    testID={testID}
  >
    {children}
  </Text>
);

export default INatText;
