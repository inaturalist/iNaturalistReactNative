import classnames from "classnames";
import { ActivityIndicator } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { getShadow } from "styles/global";

const DROP_SHADOW = getShadow( );

const LoadingIndicator = ( ) => (
  <View
    style={DROP_SHADOW}
    className={classnames(
      "h-[80px]",
      "w-[80px]",
      "bg-white",
      "right-[40px]",
      "bottom-[40px]",
      "justify-center",
      "rounded-full",
    )}
  >
    <ActivityIndicator size={50} />
  </View>
);

export default LoadingIndicator;
