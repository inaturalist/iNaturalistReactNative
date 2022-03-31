// @flow

import React from "react";
import { ActivityIndicator, View } from "react-native";
import type { Node } from "react";

import { viewStyles } from "../../../styles/sharedComponents/observationViews/infiniteScroll";

const InfiniteScrollFooter = ( ): Node => (
  <View style={viewStyles.infiniteScroll}>
    <ActivityIndicator />
  </View>
);

export default InfiniteScrollFooter;
