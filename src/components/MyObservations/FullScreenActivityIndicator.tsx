import { ActivityIndicator } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";

const FullScreenActivityIndicator = () => (
  <View
    className="flex-1 justify-center items-center bg-white"
    testID="FullScreenActivityIndicator"
  >
    <ActivityIndicator size="large" />
  </View>
);

export default FullScreenActivityIndicator;
