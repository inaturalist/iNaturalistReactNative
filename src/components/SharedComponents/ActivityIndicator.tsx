import React from "react";
import type { ViewStyle } from "react-native";
import type { MD3Theme } from "react-native-paper";
import { ActivityIndicator as RNPActivityIndicator } from "react-native-paper";
import colors from "styles/tailwindColors";

interface Props {
  animating?: boolean;
  color?: string;
  hidesWhenStopped?: boolean;
  size?: number | "small" | "large";
  style?: ViewStyle;
  testID?: string;
  theme?: MD3Theme;
}

const ActivityIndicator = ( {
  animating,
  color = colors.inatGreen,
  hidesWhenStopped,
  size = 100,
  style,
  testID,
  theme,
}: Props ) => (
  <RNPActivityIndicator
    animating={animating}
    color={color}
    hidesWhenStopped={hidesWhenStopped}
    size={size}
    style={style}
    testID={testID}
    theme={theme}
  />
);

export default ActivityIndicator;
