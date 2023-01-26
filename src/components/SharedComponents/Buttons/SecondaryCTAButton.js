// @flow

import type { Node } from "react";
import React from "react";
import { Button } from "react-native-paper";
import colors from "styles/tailwindColors";

type Props = {
  testID?: string,
  children: any,
  onPress: Function,
  disabled?: boolean
}

const SecondaryCTAButton = ( {
  testID,
  children,
  onPress,
  disabled
}: Props ): Node => (
  <Button
    testID={testID}
    onPress={onPress}
    mode="text"
    textColor={colors.black}
    disabled={disabled}
  >
    {children}
  </Button>
);

export default SecondaryCTAButton;
