import { View } from "components/styledComponents";
import NativeNewsView from "inaturalist-mobile-native-screens";
import React from "react";

const nativeStyle = {
  flex: 1,
};
const News = ( ) => (
  <View className="flex-1">
    <NativeNewsView style={nativeStyle} />
  </View>
);

export default News;
