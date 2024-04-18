// @flow

import classnames from "classnames";
import { ActivityIndicator } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";

type Props = {
  getShadow: ( ) => void,
  theme: object
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
    <ActivityIndicator size={50} />
  </View>
);

export default LoadingIndicator;
