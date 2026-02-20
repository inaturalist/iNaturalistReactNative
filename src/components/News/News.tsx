import { View } from "components/styledComponents";
import { InaturalistMobileNativeScreensView } from "inaturalist-mobile-native-screens";
import React from "react";

const nativeStyle = {
  flex: 1,
};
const News = ( ) => (
  <View className="flex-1">
    <InaturalistMobileNativeScreensView style={nativeStyle} color="red" />
  </View>
);

export default News;
