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

const Heading2 = ( {
  children, testID, style, className
}: Props ): Node => {
  let textClass = "text-2xl";

  if ( className ) {
    textClass = textClass.concat( " ", className );
  }

  return (
    <Text
      className={textClass}
      style={style}
      testID={testID}
    >
      {children}
    </Text>
  );
};

export default Heading2;
