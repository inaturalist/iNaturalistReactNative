// @flow

import colors from "colors";
import type { Node } from "react";
import React from "react";
import { Button } from "react-native-paper";

type Props = {
  children: any,
  onPress: Function,
  testID?: string,
  disabled?: boolean
}

const SecondaryCTAButton = ( {
  children,
  onPress,
  testID,
  disabled
}: Props ): Node => (
  <Button
    onPress={onPress}
    mode="text"
    testID={testID}
    textColor={colors.black}
    disabled={disabled}
  >
    {children}
  </Button>
);

export default SecondaryCTAButton;
