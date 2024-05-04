// @flow

import classnames from "classnames";
import { ActivityIndicator } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { getShadowForColor } from "styles/global";
import colors from "styles/tailwindColors";

const DROP_SHADOW = getShadowForColor( colors.darkGray );

const LoadingIndicator = ( ): Node => (
  <View
    style={DROP_SHADOW}
    className={classnames(
      "h-[80px]",
      "w-[80px]",
      "bg-white",
      "right-[40px]",
      "bottom-[40px]",
      "justify-center",
      "rounded-full"
    )}
  >
    <ActivityIndicator size={50} />
  </View>
);

export default LoadingIndicator;
