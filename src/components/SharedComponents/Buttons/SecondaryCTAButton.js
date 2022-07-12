// @flow

import React from "react";
import type { Node } from "react";
import { Button } from "react-native-paper";

import { colors } from "../../../styles/global";

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
