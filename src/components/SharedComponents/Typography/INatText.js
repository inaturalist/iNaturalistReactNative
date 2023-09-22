// @flow

import { Text } from "components/styledComponents";
import type { Node } from "react";
import React from "react";

type Props = {
  children: any,
  testID?: string,
  style?: any,
  className?: string
}

const INatText = ( {
  children, testID, style, className
}: Props ): Node => (
  <Text
    style={style}
    testID={testID}
    className={className}
  >
    {children}
  </Text>
);

export default INatText;
