// @flow

import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";

const P = ( props: any ): Node => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <View className="mb-3" {...props}>{ props.children }</View>
);

export default P;
