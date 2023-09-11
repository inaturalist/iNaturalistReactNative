// @flow

import classnames from "classnames";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { ActivityIndicator } from "react-native-paper";

type Props = {
  getShadow: Function,
  theme: Object
};

const LoadingIndicator = ( { getShadow, theme }: Props ): Node => (
  <View
    style={getShadow( theme.colors.primary )}
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
    <ActivityIndicator large />
  </View>
);

export default LoadingIndicator;
