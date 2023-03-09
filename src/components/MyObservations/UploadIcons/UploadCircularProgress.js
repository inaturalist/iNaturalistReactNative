// @flow

import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect, useRef } from "react";
import { Easing } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { IconButton, useTheme } from "react-native-paper";

type Props = {
  layout?: "horizontal" | "vertical",
  white?: boolean
}

const UploadCircularProgress = ( { layout, white }: Props ): Node => {
  const theme = useTheme( );
  const circularProgress = useRef( );

  // Will fill the progress bar linearly in 6 seconds
  useEffect( ( ) => {
    if ( circularProgress.current ) {
      circularProgress.current.animate( 100, 6000, Easing.quad );
    }
  }, [circularProgress] );

  return (
    <View className={layout === "horizontal" ? "mb-1" : "mr-5"}>
      <AnimatedCircularProgress
        ref={circularProgress}
        size={33}
        width={2}
        fill={100}
        tintColor={white ? theme.colors.onPrimary : theme.colors.primary}
      />
      <View className={layout === "vertical" ? "absolute" : "absolute -mx-1 -my-1"}>
        <IconButton
          icon="arrow-up-plain"
          size={15}
          iconColor={white && theme.colors.onPrimary}
          disabled={false}
          accessibilityState={{ disabled: false }}
        />
      </View>
    </View>
  );
};

export default UploadCircularProgress;
