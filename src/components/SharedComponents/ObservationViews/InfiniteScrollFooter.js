// @flow

import type { Node } from "react";
import React from "react";
import { ActivityIndicator } from "react-native";

import { View } from "../../styledComponents";

const InfiniteScrollFooter = ( ): Node => (
  <View className="h-32 border border-border pt-10">
    <ActivityIndicator />
  </View>
);

export default InfiniteScrollFooter;
