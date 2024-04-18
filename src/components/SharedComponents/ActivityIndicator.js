import type { Node } from "react";
import React from "react";
import { ActivityIndicator as RNPActivityIndicator } from "react-native-paper";
import colors from "styles/tailwindColors";

type Props = {
  animating?: boolean,
  color?: string,
  hidesWhenStopped?: boolean,
  size?: number,
  style?: any,
  testID?: string,
  theme?: any,
}

const ActivityIndicator = ( {
  animating,
  color = colors.inatGreen,
  hidesWhenStopped,
  size = 100,
  style,
  testID,
  theme
}: Props ): Node => (
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
