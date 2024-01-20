import { Body1 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";

const SoundSlide = ( { sound } ) => (
  <View className="h-72 w-screen items-center justify-center">
    <Body1>{ sound.file_url }</Body1>
  </View>
);

export default SoundSlide;
