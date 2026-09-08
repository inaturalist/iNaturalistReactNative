import { PaperActivityIndicator } from "components/styledComponents";
import React from "react";
import type { ViewStyle } from "react-native";
import type { MD3Theme } from "react-native-paper";
import colors from "styles/tailwindColors";

interface Props {
  animating?: boolean;
  className?: string;
  color?: string;
  hidesWhenStopped?: boolean;
  size?: number | "small" | "large";
  style?: ViewStyle;
  testID?: string;
  theme?: MD3Theme;
}

const ActivityIndicator = ( {
  animating,
  className,
  color = colors.inatGreen,
  hidesWhenStopped,
  size = 100,
  style,
  testID,
  theme,
}: Props ) => (
  <PaperActivityIndicator
    animating={animating}
    className={className}
    color={color}
    hidesWhenStopped={hidesWhenStopped}
    size={size}
    style={style}
    testID={testID}
    theme={theme}
  />
);

export default ActivityIndicator;
