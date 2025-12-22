import classnames from "classnames";
import { INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { getShadow } from "styles/global";
import colors from "styles/tailwindColors";

const DROP_SHADOW = getShadow( );

// Styling the outer element to be the white background wasn't looking right
// in android, so instead we insert smaller white circle behind the icon
const SpeciesSeenCheckmark = ( ) => (
  <View
    className="rounded-full items-center"
    style={DROP_SHADOW}
    testID="SpeciesSeenCheckmark"
  >
    <View
      className={classnames(
        "w-[16px]",
        "h-[16px]",
        "bg-white",
        "absolute",
        "rounded-full",
        "top-1/2",
        "mt-[-8px]",
      )}
    />
    <View className="-mt-[0.5px]">
      <INatIcon
        name="checkmark-circle"
        size={20}
        color={colors.inatGreen}
      />
    </View>
  </View>
);
export default SpeciesSeenCheckmark;
