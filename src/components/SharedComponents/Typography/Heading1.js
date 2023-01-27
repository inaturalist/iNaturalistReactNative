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

const Heading1 = ( {
  children, testID, style, className
}: Props ): Node => {
  let textClass = "text-3xl leading-7";

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

export default Heading1;
