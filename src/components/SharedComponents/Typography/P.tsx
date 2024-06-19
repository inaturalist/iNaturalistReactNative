import { View } from "components/styledComponents";
import React from "react";
import { ViewProps } from "react-native";

const P = ( props: ViewProps ) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <View className="mb-3" {...props}>{ props.children }</View>
);

export default P;
