// @flow

import { LightText } from "components/styledComponents";
import type { Node } from "react";
import React from "react";

type Props = {
  children: any,
  testID?: string,
  style?: any,
  className?: string
}

const Body4 = ( {
  children, testID, style, className
}: Props ): Node => {
  let textClass = "text-xs leading-3";

  if ( className ) {
    textClass = textClass.concat( " ", className );
  }

  return (
    <LightText
      className={textClass}
      style={style}
      testID={testID}
    >
      {children}
    </LightText>
  );
};

export default Body4;
