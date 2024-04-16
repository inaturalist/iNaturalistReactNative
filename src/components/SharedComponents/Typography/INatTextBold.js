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

const INatTextBold = ( {
  children, testID, style, className, ...props
}: Props ): Node => (
  <Text
    /* eslint-disable react/jsx-props-no-spreading */
    {...props}
    style={style}
    testID={testID}
    className={className}
  >
    {children}
  </Text>
);

export default INatTextBold;
