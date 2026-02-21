import { View } from "components/styledComponents";
import NativeNewsView, {
  InaturalistMobileNativeScreensView,
} from "inaturalist-mobile-native-screens";
import React from "react";
import { Platform } from "react-native";

const nativeStyle = {
  flex: 1,
};
const News = ( ) => ( Platform.OS === "ios"
  ? (
    <View className="flex-1">
      <NativeNewsView style={nativeStyle} />
    </View>
  )
  : (
    <View className="flex-1">
      <InaturalistMobileNativeScreensView style={nativeStyle} />
    </View>
  ) );

export default News;
