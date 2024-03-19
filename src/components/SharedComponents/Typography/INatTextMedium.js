// @flow

import { MediumText } from "components/styledComponents";
import type { Node } from "react";
import React from "react";

type Props = {
  children: any,
  testID?: string,
  style?: any,
  className?: string
}

const INatTextMedium = ( {
  children, testID, style, className, ...props
}: Props ): Node => (
  <MediumText
    /* eslint-disable react/jsx-props-no-spreading */
    {...props}
    style={style}
    testID={testID}
    className={className}
  >
    {children}
  </MediumText>
);

export default INatTextMedium;
