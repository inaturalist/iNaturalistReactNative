import {
  ActivityIndicator,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";

const ActivityIndicatorDemo = ( ) => (
  <View className="flex-row justify-between p-4">
    <ActivityIndicator />
    <ActivityIndicator color="orange" />
    <ActivityIndicator color="deeppink" size={50} />
  </View>
);

export default ActivityIndicatorDemo;
