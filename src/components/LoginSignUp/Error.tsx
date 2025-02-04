import {
  INatIcon,
  List2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import colors from "styles/tailwindColors";

interface Props {
  error: string;
}

const Error = ( { error }: Props ) => (
  <View className="flex-row items-center justify-center mt-5">
    <View className="relative items-center justify-center">
      <View className="absolute bg-white w-[4px] h-[14px]" />
      <INatIcon
        name="triangle-exclamation"
        size={19}
        color={colors.warningRed}
      />
    </View>
    <List2 className="color-white ml-3">
      {error}
    </List2>
  </View>
);

export default Error;
