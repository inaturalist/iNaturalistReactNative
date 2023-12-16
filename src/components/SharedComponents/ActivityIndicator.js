import type { Node } from "react";
import React from "react";
import { ActivityIndicator as RNPActivityIndicator } from "react-native-paper";
import colors from "styles/tailwindColors";

type Props = {
  animating?: boolean,
  color?: string,
  hidesWhenStopped?: boolean,
  size?: number,
  style?: Object,
  theme?: Object,
}

const ActivityIndicator = ( {
  animating,
  color = colors.inatGreen,
  hidesWhenStopped,
  size = 100,
  style,
  theme
}: Props ): Node => (
  <RNPActivityIndicator
    animating={animating}
    color={color}
    hidesWhenStopped={hidesWhenStopped}
    size={size}
    style={style}
    theme={theme}
  />
);

export default ActivityIndicator;
