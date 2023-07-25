// @flow

import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { ActivityIndicator } from "react-native-paper";

const LoadingIndicator = ( ): Node => (
  <View className="h-[80px] w-[80px] bg-white right-[40px] bottom-[40px] justify-center">
    <ActivityIndicator large />
  </View>
);

export default LoadingIndicator;
