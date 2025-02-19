// @flow

import { ActivityIndicator } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";

const FullScreenActivityIndicator = ( ): Node => (
  <View className="flex-1 justify-center items-center bg-white">
    <ActivityIndicator size="large" />
  </View>
);

export default FullScreenActivityIndicator;
