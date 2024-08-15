// @flow

import { INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";
import { getShadow } from "styles/global";

const DROP_SHADOW = getShadow( );

const SpeciesSeenCheckmark = ( ): Node => {
  const theme = useTheme( );

  // Styling the outer element to be the white background wasn't looking right
  // in android, so instead we insert smaller white circle behind the icon
  return (
    <View
      className="rounded-full"
      style={DROP_SHADOW}
      testID="SpeciesSeenCheckmark"
    >
      <View className="w-[18px] h-[18px] top-[1px] bg-white absolute rounded-full" />
      <View className="-mt-[0.5px]">
        <INatIcon
          name="checkmark-circle"
          size={20}
          color={theme.colors.secondary}
        />
      </View>
    </View>
  );
};

export default SpeciesSeenCheckmark;
