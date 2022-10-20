// @flow

import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { ActivityIndicator } from "react-native";

const InfiniteScrollFooter = ( ): Node => (
  <View className="h-32 border border-border pt-10">
    <ActivityIndicator />
  </View>
);

export default InfiniteScrollFooter;
