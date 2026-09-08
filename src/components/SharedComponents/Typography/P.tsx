import { View } from "components/styledComponents";
import React from "react";
import type { ViewProps } from "react-native";
import { twMerge } from "tailwind-merge";

const P = ( props: ViewProps ) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <View {...props} className={twMerge( "mb-3", props.className )}>{ props.children }</View>
);

export default P;
