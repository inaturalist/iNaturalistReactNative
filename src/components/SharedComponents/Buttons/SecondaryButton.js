// @flow

import type { Node } from "react";
import React from "react";
import { Button } from "react-native-paper";

import colors from "../../../styles/colors";
import { viewStyles } from "../../../styles/sharedComponents/buttons/secondaryButton";

type Props = {
  children: any,
  onPress: Function,
  testID: ?string
}

const SecondaryButton = ( {
  children,
  onPress,
  testID
}: Props ): Node => (
  <Button
    onPress={onPress}
    testID={testID}
    buttonColor={colors.secondary}
    textColor={colors.white}
    style={viewStyles.secondaryButton}
  >
    {children}
  </Button>
);

export default SecondaryButton;
