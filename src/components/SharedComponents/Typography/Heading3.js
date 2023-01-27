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

const Heading3 = ( {
  children, testID, style, className
}: Props ): Node => {
  let textClass = "text-lg leading-5";

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

export default Heading3;
