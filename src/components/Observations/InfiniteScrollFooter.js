// @flow

import type { Node } from "react";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { viewStyles } from "styles/observations/infiniteScroll";

const InfiniteScrollFooter = ( ): Node => (
  <View style={viewStyles.infiniteScroll}>
    <ActivityIndicator />
  </View>
);

export default InfiniteScrollFooter;
