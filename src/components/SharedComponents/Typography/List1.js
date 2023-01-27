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

const List1 = ( {
  children, testID, style, className
}: Props ): Node => {
  let textClass = "text-base leading-6";

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

export default List1;
